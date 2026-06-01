import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config, connectDatabase, prisma } from './config';
import { verifyMetaSignature } from './middleware/auth.middleware';
import { handleHandshake, handleIncomingEvent, registerSocketEmitter, emitNewMessage } from './controllers/webhook.controller';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io Server with open CORS for premium dashboard communication
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Configure CORS and JSON Body parsing with custom RAW BODY capture for HMAC signature auditing
app.use(cors({ origin: '*' }));
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf; // Bind raw binary buffer for cryptographic checks
    },
  })
);

// ----------------------------------------------------
// 🔗 Route Registrations
// ----------------------------------------------------

// Core Webhook Routes (Meta integration channel)
app.get('/api/v1/webhook', handleHandshake);
app.post('/api/v1/webhook', verifyMetaSignature, handleIncomingEvent);

// 📂 Next.js Unified Inbox Rest APIs

// 1. Get Workspace Conversation Threads
app.get('/api/v1/chats', async (req, res) => {
  const workspaceId = req.query.workspaceId as string;
  if (!workspaceId) {
    return res.status(400).json({ error: 'Parameter workspaceId is required.' });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: { workspaceId },
      include: {
        contact: true,
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
    return res.status(200).json(conversations);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch conversation threads.', details: error.message });
  }
});

// 2. Get Messages in a Conversation
app.get('/api/v1/chats/:id/messages', async (req, res) => {
  const conversationId = req.params.id;

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { sentAt: 'asc' },
    });
    return res.status(200).json(messages);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch messages.', details: error.message });
  }
});

// 3. Send Outbound Agent Message
app.post('/api/v1/chats/:id/messages', async (req, res) => {
  const conversationId = req.params.id;
  const { textContent, senderId } = req.body;

  if (!textContent) {
    return res.status(400).json({ error: 'Parameter textContent is required.' });
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation thread not found.' });
    }

    // Log the outbound agent message
    const message = await prisma.message.create({
      data: {
        workspaceId: conversation.workspaceId,
        conversationId,
        direction: 'OUTBOUND',
        senderId: senderId || null,
        textContent,
        metaMessageId: `agent-outbound-msg-${crypto.randomUUID()}`,
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    // Update conversation timeline
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Broadcast message via Socket.io so other concurrent agents see it instantly
    if (emitNewMessage) {
      emitNewMessage(conversation.workspaceId, {
        event: 'message_received',
        data: {
          message,
          conversationId,
        },
      });
    }

    return res.status(201).json(message);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to send message.', details: error.message });
  }
});

// 4. Toggle CRM Lead Autopilot status (Agent Takeover flag)
app.patch('/api/v1/contacts/:id/ai', async (req, res) => {
  const contactId = req.params.id;
  const { isAiEnabled } = req.body;

  if (isAiEnabled === undefined) {
    return res.status(400).json({ error: 'Parameter isAiEnabled is required.' });
  }

  try {
    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: { isAiEnabled },
    });

    console.log(`🤖 Lead Autopilot toggled to [${isAiEnabled}] for contact ID: ${contactId}`);

    return res.status(200).json(contact);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to toggle AI state.', details: error.message });
  }
});

// 5. Multi-Tenant Workspace CRM Contacts Retrieval Endpoint
app.get('/api/v1/contacts', async (req, res) => {
  const workspaceId = req.query.workspaceId as string;
  if (!workspaceId) {
    return res.status(400).json({ error: 'Parameter workspaceId is required.' });
  }

  try {
    const contacts = await prisma.contact.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(contacts);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
});

// Seed Setup Endpoint: Establishes a tenant Workspace & Admin for immediate testing
app.post('/api/v1/setup-sandbox', async (req, res) => {
  const { workspaceName, metaPhoneNumberId, email, fullName } = req.body;

  if (!workspaceName || !metaPhoneNumberId || !email || !fullName) {
    return res.status(400).json({
      error: 'Missing parameters. Required: workspaceName, metaPhoneNumberId, email, fullName',
    });
  }

  try {
    // 1. Establish tenant Workspace
    const workspace = await prisma.workspace.upsert({
      where: { metaPhoneNumberId },
      update: { name: workspaceName },
      create: {
        name: workspaceName,
        metaPhoneNumberId,
        metaWabaId: 'waba_mock_id_99',
      },
    });

    // 2. Establish User Profile
    const user = await prisma.user.upsert({
      where: { email },
      update: { fullName },
      create: {
        email,
        passwordHash: '$2a$10$eFytJDGtjbFq88/zOaM6G.R6yWv253d8V8zLdZp5x7F2s.1X9rA5C', // mock hash
        fullName,
      },
    });

    // 3. Connect member assignment role
    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: user.id,
        },
      },
      update: { role: 'ADMIN' },
      create: {
        workspaceId: workspace.id,
        userId: user.id,
        role: 'ADMIN',
      },
    });

    console.log(`🎁 Sandbox Workspace [${workspaceName}] and Admin User [${email}] successfully seeded.`);

    return res.status(201).json({
      message: 'Workspace successfully seeded in database.',
      workspace,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error: any) {
    console.error('❌ Sandbox setup error:', error);
    return res.status(500).json({ error: 'Failed to seed workspace sandbox.', details: error.message });
  }
});

// Server Welcome Gateway Descriptor
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'WhatBot PRO API Core Gateway',
    version: '1.0.0',
    documentation: 'https://wa.link/b5f6ly',
    author: 'BITSOL Marketing',
    health: 'http://localhost:5001/health',
    timestamp: new Date()
  });
});

// Server Health Checker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// ----------------------------------------------------
// ⚡ Real-Time Socket Connection Handlers
// ----------------------------------------------------

// Register clean Socket emitter closure callback in the Webhook Controller
registerSocketEmitter((workspaceId: string, payload: any) => {
  const roomName = `workspace:${workspaceId}`;
  io.to(roomName).emit('new_event', payload);
  console.log(`📡 Broadcasted live event to WebSocket room: ${roomName} (${payload.event})`);
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected via WebSockets: ${socket.id}`);

  // Multi-tenant isolation: Clients join explicit workspace rooms
  socket.on('join_workspace', (workspaceId: string) => {
    const roomName = `workspace:${workspaceId}`;
    socket.join(roomName);
    console.log(`👥 WebSocket ${socket.id} joined isolated room: ${roomName}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ----------------------------------------------------
// 🚀 Boot Application
// ----------------------------------------------------
async function main() {
  // Connect database client pool
  await connectDatabase();

  // Run Express HTTP listener
  server.listen(config.port, () => {
    console.log(`🚀 WABot Pro Server running in [${config.nodeEnv}] on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('❌ Server startup crashed:', err);
  process.exit(1);
});
