// simple-server.js
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyEnv from '@fastify/env';
import fastifyWebsocket from '@fastify/websocket';
import fastifyFormBody from '@fastify/formbody';
import { join } from 'path';
import { fileURLToPath } from 'url';
import twilio from 'twilio';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Initialize Fastify with verbose logging
const fastify = Fastify({
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty'
    }
  }
});

// Register form body parser - CRITICAL for Twilio webhooks
await fastify.register(fastifyFormBody);

// Define env schema
const schema = {
  type: 'object',
  required: ['PORT', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER', 'AGENT_NUMBER', 'BASE_URL'],
  properties: {
    PORT: { type: 'string', default: '3000' },
    TWILIO_ACCOUNT_SID: { type: 'string' },
    TWILIO_AUTH_TOKEN: { type: 'string' },
    TWILIO_PHONE_NUMBER: { type: 'string' },
    AGENT_NUMBER: { type: 'string' },
    BASE_URL: { type: 'string' }
  }
};

// WebSocket connections store
const connections = new Set();

// Register plugins
await fastify.register(fastifyEnv, { schema });
await fastify.register(fastifyWebsocket);

// Serve static files
await fastify.register(fastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/'
});

// Initialize Twilio client
const twilioClient = twilio(fastify.config.TWILIO_ACCOUNT_SID, fastify.config.TWILIO_AUTH_TOKEN);

// Log every request and response for debugging
fastify.addHook('onRequest', (request, reply, done) => {
  fastify.log.info(`Request received: ${request.method} ${request.url}`);
  done();
});

fastify.addHook('preHandler', (request, reply, done) => {
  if (request.body) {
    fastify.log.debug({
      url: request.url,
      method: request.method,
      contentType: request.headers['content-type'],
      body: request.body
    }, 'Request body');
  }
  done();
});

// Routes
fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.html');
});

// WebSocket endpoint for transcripts
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection) => {
    fastify.log.info('WebSocket client connected');
    
    // Store the connection
    connections.add(connection);
    
    connection.socket.on('message', (message) => {
      fastify.log.info(`WebSocket message received: ${message}`);
    });
    
    connection.socket.on('close', () => {
      fastify.log.info('WebSocket client disconnected');
      connections.delete(connection);
    });
  });
});

// Start a conference call
fastify.post('/call', async (request, reply) => {
  const phoneNumber = request.body.phoneNumber;
  
  if (!phoneNumber) {
    return reply.code(400).send({ error: 'Phone number is required' });
  }
  
  fastify.log.info(`Starting conference call with ${phoneNumber} and ${fastify.config.AGENT_NUMBER}`);
  
  try {
    // Generate a unique conference name
    const conferenceName = `conference-${Date.now()}`;
    
    // Create TwiML for the customer call
    // Use streaming transcription for faster results
    const customerTwiml = `
      <Response>
        <Say>You are being connected to a conference call with streaming transcription.</Say>
        <Dial>
          <Conference statusCallback="${fastify.config.BASE_URL}/conference-status"
                      statusCallbackEvent="start end join leave"
                      startConferenceOnEnter="true"
                      endConferenceOnExit="false"
                      transcribe="true"
                      transcribeCallback="${fastify.config.BASE_URL}/transcribe">
            ${conferenceName}
          </Conference>
        </Dial>
      </Response>
    `;
    
    // Create call to customer
    const customerCall = await twilioClient.calls.create({
      to: phoneNumber,
      from: fastify.config.TWILIO_PHONE_NUMBER,
      twiml: customerTwiml
    });
    
    fastify.log.info(`Customer call initiated with SID: ${customerCall.sid}`);
    
    // Create call to agent
    const agentCall = await twilioClient.calls.create({
      to: fastify.config.AGENT_NUMBER,
      from: fastify.config.TWILIO_PHONE_NUMBER,
      twiml: `
        <Response>
          <Say>You are being connected to a conference call. Please wait for the customer.</Say>
          <Dial>
            <Conference startConferenceOnEnter="true" endConferenceOnExit="true">
              ${conferenceName}
            </Conference>
          </Dial>
        </Response>
      `
    });
    
    fastify.log.info(`Agent call initiated with SID: ${agentCall.sid}`);
    
    // Log the call details to a file for debugging
    fs.appendFileSync('call-log.txt', JSON.stringify({
      timestamp: new Date().toISOString(),
      conferenceName,
      customerCallSid: customerCall.sid,
      agentCallSid: agentCall.sid,
      customerPhone: phoneNumber,
      agentPhone: fastify.config.AGENT_NUMBER
    }, null, 2) + '\n\n');
    
    return {
      success: true,
      conferenceName,
      customerCallSid: customerCall.sid,
      agentCallSid: agentCall.sid
    };
  } catch (error) {
    fastify.log.error(error, 'Failed to create conference call');
    return reply.code(500).send({ error: error.message });
  }
});

// Conference status webhook
fastify.post('/conference-status', async (request, reply) => {
  fastify.log.info({
    event: 'conference_status',
    ...request.body
  });
  
  // Broadcast conference status to all connected WebSocket clients
  const message = JSON.stringify({
    type: 'conference_status',
    status: request.body.StatusCallbackEvent,
    conferenceName: request.body.FriendlyName,
    timestamp: new Date().toISOString()
  });
  
  for (const connection of connections) {
    connection.socket.send(message);
  }
  
  return { received: true };
});

// Transcription webhook - Now optimized for streaming
fastify.post('/transcribe', async (request, reply) => {
  fastify.log.info('TRANSCRIPTION RECEIVED!');
  
  // Log everything about this request
  fastify.log.info({
    headers: request.headers,
    body: request.body,
    query: request.query
  });
  
  // Save to file for debugging
  fs.appendFileSync('transcription-log.txt', JSON.stringify({
    timestamp: new Date().toISOString(),
    headers: request.headers,
    body: request.body
  }, null, 2) + '\n\n');
  
  // Extract the transcription text and participant
  const transcriptionText = request.body.TranscriptionText;
  const participant = request.body.From === fastify.config.AGENT_NUMBER ? 'Agent' : 'Customer';
  
  if (transcriptionText) {
    fastify.log.info(`Transcription text from ${participant}: ${transcriptionText}`);
    
    // Broadcast to all connected WebSocket clients
    const message = JSON.stringify({
      type: 'transcription',
      text: transcriptionText,
      participant: participant,
      timestamp: new Date().toISOString(),
      confidence: request.body.Confidence || 'unknown'
    });
    
    fastify.log.info(`Broadcasting to ${connections.size} clients`);
    
    for (const connection of connections) {
      connection.socket.send(message);
    }
  } else {
    fastify.log.warn('No transcription text received');
  }
  
  return { received: true };
});

// Start the server
try {
  await fastify.listen({ port: fastify.config.PORT, host: '0.0.0.0' });
  console.log(`Server listening on ${fastify.server.address().port}`);
  console.log(`Base URL: ${fastify.config.BASE_URL}`);
  console.log(`Transcription callback: ${fastify.config.BASE_URL}/transcribe`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
