import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'wabot_pro_jwt_ultra_secret_key_development_2026',
  metaVerifyToken: process.env.META_VERIFY_TOKEN || 'wabot_pro_secret_token',
  metaAppSecret: process.env.META_APP_SECRET || 'c8e622b104938a1a3614945d8b742ff8',
  metaAccessToken: process.env.META_ACCESS_TOKEN || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  pineconeApiKey: process.env.PINECONE_API_KEY || '',
  pineconeEnvironment: process.env.PINECONE_ENVIRONMENT || '',
};

// Instantiate the singleton Prisma Database Client
export const prisma = new PrismaClient();

// Log connection status
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Multi-Tenant Database Connection Established Successfully.');
  } catch (error) {
    console.error('❌ Failed to establish database connection:', error);
    process.exit(1);
  }
}
