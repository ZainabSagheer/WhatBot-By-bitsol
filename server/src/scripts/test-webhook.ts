import crypto from 'crypto';
import { prisma, config } from '../config';

/**
 * 🧪 WABot Pro Integration & Webhook Security Test Suite
 * Asserts full signature cryptography, multi-tenant lead creation, 
 * and AI automatic responder workflows in local environments.
 */
async function runTest() {
  console.log('🧪 Starting Webhook Cryptography & AI Core Integration Test...');
  
  // Clean up any old sandbox test entries to ensure clean run assertions
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.workspace.deleteMany({ where: { metaPhoneNumberId: '1234567890' } });

  // 1. Seed Sandbox Workspace (Simulates a client onboarding setup)
  console.log('🌱 Step 1: Seeding Sandbox Workspace Tenant...');
  const workspace = await prisma.workspace.create({
    data: {
      name: 'BITSOL Support Sandbox',
      metaPhoneNumberId: '1234567890', // Test Meta ID
      metaWabaId: 'waba_sandbox_id_11',
    },
  });
  console.log(`✅ Sandbox Workspace successfully created: ID = ${workspace.id}`);

  // 2. Prepare Mock WhatsApp Payload
  console.log('📦 Step 2: Formulating Simulated Meta Payload...');
  const mockPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'mock_waba_account_id',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '16505553333',
                phone_number_id: '1234567890', // Target Workspace Phone ID
              },
              contacts: [
                {
                  profile: {
                    name: 'Zainab Sagheer',
                  },
                  wa_id: '923103175175',
                },
              ],
              messages: [
                {
                  from: '923103175175',
                  id: 'meta-msg-uuid-99999-testing-id',
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: {
                    body: 'kya price hai conversiq package ki?', // User query
                  },
                  type: 'text',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  // 3. Cryptographically Sign the payload using our active Meta App Secret key
  console.log('🔐 Step 3: Hashing payload with HMAC SHA-256 App Secret...');
  const bodyBuffer = Buffer.from(JSON.stringify(mockPayload));
  const calculatedSignature = crypto
    .createHmac('sha256', config.metaAppSecret)
    .update(bodyBuffer)
    .digest('hex');
  const signatureHeader = `sha256=${calculatedSignature}`;
  
  console.log(`   - Generated Signature Header: ${signatureHeader}`);

  // 4. Invoke Webhook processing handler directly in local environment to simulate Meta POST requests
  console.log('⚡ Step 4: Dispatching mock event to webhook processor...');
  
  // Boot dynamic Express raw body capture requirements manually
  const mockReq: any = {
    body: mockPayload,
    rawBody: bodyBuffer,
    headers: {
      'x-hub-signature-256': signatureHeader,
    },
  };

  // Import local controller handle to run local loop (simulating fast express processing)
  const webhookController = require('../controllers/webhook.controller');
  
  // Mock express response object
  let responseSent = false;
  let statusSet = 200;
  let responseBody: any = null;
  const mockRes: any = {
    status: (code: number) => {
      statusSet = code;
      return mockRes;
    },
    json: (body: any) => {
      responseSent = true;
      responseBody = body;
      return mockRes;
    },
  };

  // Execute
  await webhookController.handleIncomingEvent(mockReq, mockRes);
  
  console.log(`   - Server Inbound Response Status: ${statusSet}`);
  console.log(`   - Server Inbound Response Body:`, responseBody);

  // Assert Instant Acknowledge (HTTP 200 OK received instantly)
  if (statusSet === 200 && responseSent) {
    console.log('✅ Assertion Passed: Server instantly responded 200 OK.');
  } else {
    throw new Error('❌ Assertion Failed: Server failed to respond instantly.');
  }

  // 5. Verification of asynchronous pipeline transactions (allow AI loop and DB commits to finalize)
  console.log('⏳ Step 5: Waiting 1500ms for database commits and AI loops to resolve...');
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 6. DB Records Audit
  console.log('🔎 Step 6: Auditing Database Records...');

  // A. Contact Creation Audit
  const contact = await prisma.contact.findUnique({
    where: {
      workspaceId_phoneNumber: {
        workspaceId: workspace.id,
        phoneNumber: '923103175175',
      },
    },
  });

  if (contact && contact.firstName === 'Zainab Sagheer') {
    console.log(`✅ Success: Contact successfully ingested: "${contact.firstName}" with stage [${contact.stage}]`);
  } else {
    throw new Error('❌ Error: Contact was not successfully created or matches Profile Name.');
  }

  // B. Conversation Thread Ingestion Audit
  const conversation = await prisma.conversation.findFirst({
    where: { workspaceId: workspace.id, contactId: contact.id },
  });

  if (conversation && conversation.isOpen) {
    console.log(`✅ Success: Conversation thread initialized in open state: Thread ID = ${conversation.id}`);
  } else {
    throw new Error('❌ Error: Conversation thread was not established.');
  }

  // C. Inbound Message Logs Audit
  const inboundMessage = await prisma.message.findFirst({
    where: {
      conversationId: conversation.id,
      direction: 'INBOUND',
    },
  });

  if (inboundMessage && inboundMessage.textContent?.includes('kya price')) {
    console.log('✅ Success: Inbound message logged successfully inside database conversation logs.');
  } else {
    throw new Error('❌ Error: Inbound message query log missing or malformed.');
  }

  // D. AI Outbound Automatic Reply Audit
  const outboundMessage = await prisma.message.findFirst({
    where: {
      conversationId: conversation.id,
      direction: 'OUTBOUND',
    },
  });

  if (outboundMessage) {
    console.log(`✅ Success: AI Chatbot triggered outbound automatically: "${outboundMessage.textContent}"`);
    console.log(`   - AI Message ID: ${outboundMessage.metaMessageId}`);
  } else {
    throw new Error('❌ Error: Outbound AI reply transaction was not executed.');
  }

  console.log('\n🌟 CONGRATULATIONS! WABOT PRO SAAS CORE INTEGRATION PASSES ALL SPECIFICATIONS!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('\n❌ Integration Test Suite Failed with exceptions:', err);
  process.exit(1);
});
