import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';

// Extend Request interface to include rawBody and authenticated user data
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * 🔒 Cryptographic Verification Middleware for Meta WhatsApp Cloud API Webhooks
 * Verifies that incoming webhooks are authentic and sent by Meta using HMAC SHA-256.
 */
export function verifyMetaSignature(req: Request, res: Response, next: NextFunction) {
  const signatureHeader = req.headers['x-hub-signature-256'] as string;

  if (!signatureHeader) {
    console.warn('⚠️ Missing X-Hub-Signature-256 header in incoming webhook.');
    return res.status(401).json({ error: 'Signature header is missing.' });
  }

  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    console.warn('⚠️ Invalid signature header format.');
    return res.status(401).json({ error: 'Invalid signature format.' });
  }

  const providedSignature = parts[1];
  
  // Retrieve the raw body parsed during Express initialization
  const rawBody = req.rawBody;
  if (!rawBody) {
    console.error('❌ Server Error: Raw body buffer was not captured. Ensure raw body parser is configured.');
    return res.status(500).json({ error: 'Internal signature verification failure.' });
  }

  // Calculate HMAC SHA-256 signature using Meta App Secret
  const calculatedSignature = crypto
    .createHmac('sha256', config.metaAppSecret)
    .update(rawBody)
    .digest('hex');

  // Secure constant-time comparison to prevent timing attacks
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(providedSignature, 'hex'),
    Buffer.from(calculatedSignature, 'hex')
  );

  if (!isMatch) {
    console.error('❌ Security Alert: Webhook HMAC SHA-256 signature verification failed.');
    return res.status(401).json({ error: 'Invalid cryptographic signature.' });
  }

  // Signature is authentic, proceed
  next();
}

/**
 * 🔑 JWT Authorization Middleware
 * Secures workspace API routes, extracting and validating tokens.
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required (Bearer format).' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}
