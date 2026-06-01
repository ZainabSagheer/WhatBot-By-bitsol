import { Request, Response } from 'express';
import { config, prisma } from '../config';

// Global Event Bus / WebSocket emitter handle
export let emitNewMessage: ((workspaceId: string, payload: any) => void) | null = null;

// Registry helper to inject Socket.io emitter into this controller
export function registerSocketEmitter(emitter: (workspaceId: string, payload: any) => void) {
  emitNewMessage = emitter;
}

/**
 * 🔗 GET /api/v1/webhook
 * Handles Meta Cloud Webhook verification handshake process.
 */
export async function handleHandshake(req: Request, res: Response) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('📬 Meta Webhook subscription verification requested.');

  if (mode === 'subscribe' && token === config.metaVerifyToken) {
    console.log('✅ Webhook handshake verification successful.');
    return res.status(200).send(challenge);
  }

  console.warn('❌ Webhook handshake verification failed. Token mismatch.');
  return res.status(403).json({ error: 'Verification token mismatch' });
}

/**
 * ⚡ POST /api/v1/webhook
 * Receives incoming WhatsApp events (messages, status updates).
 * Responds with HTTP 200 OK instantly, then parses and processes events in the background.
 */
export async function handleIncomingEvent(req: Request, res: Response) {
  const payload = req.body;

  // 1. Instantly acknowledge receipt to Meta (prevents retries & drops connection hold times)
  res.status(200).json({ status: 'received' });

  // 2. Delegate heavier parsing and transactions to asynchronous background execution
  processWebhookAsync(payload).catch((err) => {
    console.error('❌ Background error processing webhook payload:', err);
  });
}

/**
 * ⚙️ Asynchronous Webhook Processor Pipeline
 * Parses messaging values, verifies idempotency, saves to SQLite/Postgres DB, and triggers AI/Flow responses.
 */
async function processWebhookAsync(payload: any) {
  if (!payload || payload.object !== 'whatsapp_business_account') {
    return;
  }

  const entries = payload.entry || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      if (change.field !== 'messages') continue;

      const value = change.value;
      if (!value) continue;

      const metadata = value.metadata;
      const phoneId = metadata?.phone_number_id; // Meta Phone ID for multi-tenant matching

      // 🔍 Identify corresponding SaaS Tenant Workspace via Meta Phone Number ID
      const workspace = await prisma.workspace.findFirst({
        where: { metaPhoneNumberId: phoneId },
      });

      if (!workspace) {
        console.warn(`⚠️ Received message webhook for unknown Meta Phone ID: ${phoneId}. Ignoring.`);
        continue;
      }

      const workspaceId = workspace.id;

      // ==========================================
      // Case A: Receive Inbound Messages
      // ==========================================
      if (value.messages && value.messages.length > 0) {
        for (const metaMsg of value.messages) {
          const fromNumber = metaMsg.from; // Customer WhatsApp Number
          const metaMessageId = metaMsg.id; // Unique Message ID from Meta
          const textContent = metaMsg.text?.body || '';
          const type = metaMsg.type;

          const contactName = value.contacts?.[0]?.profile?.name || 'WhatsApp Customer';

          console.log(`💬 Inbound Message [${metaMessageId}] from ${fromNumber}: "${textContent}"`);

          // 1. Idempotency Check (Check if message was already logged to prevent double-processing)
          const existingMessage = await prisma.message.findUnique({
            where: { metaMessageId },
          });

          if (existingMessage) {
            console.log(`ℹ️ Duplicate message detected [${metaMessageId}]. Skipping ingestion.`);
            continue;
          }

          // 2. Resolve Contact Card inside the multi-tenant CRM database
          let contact = await prisma.contact.findUnique({
            where: {
              workspaceId_phoneNumber: {
                workspaceId,
                phoneNumber: fromNumber,
              },
            },
          });

          if (!contact) {
            // New Lead auto-creation in CRM
            contact = await prisma.contact.create({
              data: {
                workspaceId,
                phoneNumber: fromNumber,
                firstName: contactName,
                stage: 'NEW',
              },
            });
            console.log(`👤 CRM Lead created for new contact: ${fromNumber} (${contactName})`);
          }

          // 3. Resolve active Conversation thread or create a new open one
          let conversation = await prisma.conversation.findFirst({
            where: {
              workspaceId,
              contactId: contact.id,
              isOpen: true,
            },
          });

          if (!conversation) {
            conversation = await prisma.conversation.create({
              data: {
                workspaceId,
                contactId: contact.id,
                isOpen: true,
              },
            });
          }

          // 4. Log the message inside the database thread
          const savedMsg = await prisma.message.create({
            data: {
              workspaceId,
              conversationId: conversation.id,
              metaMessageId,
              direction: 'INBOUND',
              textContent,
              mediaType: type !== 'text' ? type : null,
              status: 'READ',
              sentAt: new Date(),
            },
          });

          // 5. Update last conversation contact timestamp
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() },
          });

          // 6. Broadcast event via WebSockets to Next.js Unified Inbox agents
          if (emitNewMessage) {
            emitNewMessage(workspaceId, {
              event: 'message_received',
              data: {
                message: savedMsg,
                conversationId: conversation.id,
                contact,
              },
            });
          }

          // 7. Execute AI Chatbot automation loop if chatbot is enabled and agent takeover flag is false
          if (contact.isAiEnabled) {
            triggerAiResponseLoop(workspaceId, conversation.id, contact.id, textContent).catch((err) => {
              console.error('❌ AI Chatbot Execution Loop failure:', err);
            });
          }
        }
      }

      // ==========================================
      // Case B: Delivery & Read Status Updates
      // ==========================================
      if (value.statuses && value.statuses.length > 0) {
        for (const statusObj of value.statuses) {
          const metaMessageId = statusObj.id;
          const status = statusObj.status.toUpperCase(); // DELIVERED, READ, FAILED
          const timestamp = statusObj.timestamp;

          const updatedDate = new Date(parseInt(timestamp, 10) * 1000);

          const dbMessage = await prisma.message.findUnique({
            where: { metaMessageId },
          });

          if (dbMessage) {
            const updateData: any = { status };
            if (status === 'DELIVERED') updateData.deliveredAt = updatedDate;
            if (status === 'READ') updateData.readAt = updatedDate;

            const updatedMsg = await prisma.message.update({
              where: { metaMessageId },
              data: updateData,
            });

            console.log(`📈 Message [${metaMessageId}] delivery status updated in DB: ${status}`);

            // Broadcast real-time status update to agents
            if (emitNewMessage) {
              emitNewMessage(workspace.id, {
                event: 'message_status_updated',
                data: {
                  messageId: updatedMsg.id,
                  metaMessageId,
                  status,
                  conversationId: dbMessage.conversationId,
                },
              });
            }
          }
        }
      }
    }
  }
}

/**
 * 🤖 Mock AI Response Generator Loop
 * Resolves context, checks rules, generates cognitive response, and posts reply via mock Meta client.
 */
async function triggerAiResponseLoop(
  workspaceId: string,
  conversationId: string,
  contactId: string,
  incomingText: string
) {
  console.log(`🤖 AI Chatbot Engine processing inbound query: "${incomingText}"`);

  // Simulate embedding retrieval and context matching lookup latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Determine intent (Mock Classifier)
  let replyText = '';
  const lowercaseInput = incomingText.toLowerCase();

  if (lowercaseInput.includes('kya haal') || lowercaseInput.includes('hello') || lowercaseInput.includes('hi')) {
    replyText = 'Hello! Welcome to BITSOL Marketing WhatsApp Support. How can I help you setup Conversiq AI today? Roman Urdu aur English dono main pooch sakte hain!';
  } else if (lowercaseInput.includes('price') || lowercaseInput.includes('rate') || lowercaseInput.includes('paisa')) {
    replyText = 'Conversiq AI complete automation package start hota hai just PKR 20,000 one-time setup fee main. Is main 24/7 AI lead capture, dynamic sheet sync, aur life-time updates included hain!';
  } else if (lowercaseInput.includes('book') || lowercaseInput.includes('order') || lowercaseInput.includes('buy')) {
    replyText = 'Excellent choice! Please share your full name and email so we can compile your lead profile and sync your database. Setup takes less than 24 hours.';
  } else {
    // Generative fallback
    replyText = `Thank you for contacting us. I have logged your query about: "${incomingText}". Our agent is reviewing it. Or you can type "price" to see package details!`;
  }

  // 1. Save AI outbound reply to database
  const aiMsg = await prisma.message.create({
    data: {
      workspaceId,
      conversationId,
      direction: 'OUTBOUND',
      metaMessageId: `ai-simulated-msg-${crypto.randomUUID()}`,
      textContent: replyText,
      status: 'SENT',
      sentAt: new Date(),
    },
  });

  console.log(`🤖 AI Chatbot replied outbound: "${replyText}"`);

  // 2. Broadcast outbound AI reply via WebSockets to agents
  if (emitNewMessage) {
    emitNewMessage(workspaceId, {
      event: 'message_received',
      data: {
        message: aiMsg,
        conversationId,
      },
    });
  }

  // 3. Update conversation last message timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });
}
