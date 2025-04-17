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

// Register form body parser (critical for Twilio webhooks)
await fastify.register(fastifyFormBody);

// Define environment schema
const schema = {
  type: 'object',
  required: [
    'PORT',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'AGENT_NUMBER',
    'BASE_URL'
  ],
  properties: {
    PORT: { type: 'string', default: '3000' },
    TWILIO_ACCOUNT_SID: { type: 'string' },
    TWILIO_AUTH_TOKEN: { type: 'string' },
    TWILIO_PHONE_NUMBER: { type: 'string' },
    AGENT_NUMBER: { type: 'string' },
    BASE_URL: { type: 'string' }
  }
};

await fastify.register(fastifyEnv, { schema });
await fastify.register(fastifyWebsocket);

// Serve static files from "public" directory
await fastify.register(fastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/'
});

// Initialize Twilio client
const twilioClient = twilio(
  fastify.config.TWILIO_ACCOUNT_SID,
  fastify.config.TWILIO_AUTH_TOKEN
);

// In-memory store for WebSocket connections
const connections = new Set();

// Logging hooks
fastify.addHook('onRequest', (request, reply, done) => {
  fastify.log.info(`Request received: ${request.method} ${request.url}`);
  done();
});

fastify.addHook('preHandler', (request, reply, done) => {
  if (request.body) {
    fastify.log.debug({ body: request.body }, 'Request body');
  }
  done();
});

// Serve index.html
fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.html');
});

// WebSocket endpoint for broadcasting transcripts
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection) => {
    fastify.log.info('WebSocket client connected');
    connections.add(connection);
    connection.socket.on('close', () => {
      fastify.log.info('WebSocket client disconnected');
      connections.delete(connection);
    });
  });
});

// Route: Start a conference call using Twilio's built-in transcription
fastify.post('/call', async (request, reply) => {
  const phoneNumber = request.body.phoneNumber;
  if (!phoneNumber) {
    return reply.code(400).send({ error: 'Phone number is required' });
  }

  fastify.log.info(`Starting conference call with ${phoneNumber} and ${fastify.config.AGENT_NUMBER}`);

  try {
    const conferenceName = `conference-${Date.now()}`;
    const baseUrl = fastify.config.BASE_URL;

    // Use TwiML to record the conference and request transcription.
    // Twilio will record from the start of the conference and POST the transcription to our callback endpoint.
    const customerTwiml = `
      <Response>
        <Say>You are being connected to a conference call.</Say>
        <Dial>
          <Conference record="record-from-start" 
                      transcriptionCallback="${baseUrl}/transcription-callback" 
                      startConferenceOnEnter="true" 
                      endConferenceOnExit="false">
            ${conferenceName}
          </Conference>
        </Dial>
      </Response>
    `;
    const agentTwiml = `
      <Response>
        <Say>You are being connected to a conference call. Please wait for the customer.</Say>
        <Dial>
          <Conference record="record-from-start" 
                      transcriptionCallback="${baseUrl}/transcription-callback" 
                      startConferenceOnEnter="true" 
                      endConferenceOnExit="true">
            ${conferenceName}
          </Conference>
        </Dial>
      </Response>
    `;

    // Initiate calls
    const customerCall = await twilioClient.calls.create({
      to: phoneNumber,
      from: fastify.config.TWILIO_PHONE_NUMBER,
      twiml: customerTwiml
    });
    fastify.log.info(`Customer call initiated with SID: ${customerCall.sid}`);

    const agentCall = await twilioClient.calls.create({
      to: fastify.config.AGENT_NUMBER,
      from: fastify.config.TWILIO_PHONE_NUMBER,
      twiml: agentTwiml
    });
    fastify.log.info(`Agent call initiated with SID: ${agentCall.sid}`);

    // Log call details for debugging
    fs.appendFileSync(
      'call-log.txt',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        conferenceName,
        customerCallSid: customerCall.sid,
        agentCallSid: agentCall.sid,
        customerPhone: phoneNumber,
        agentPhone: fastify.config.AGENT_NUMBER
      }, null, 2) + '\n\n'
    );

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

// Transcription callback endpoint – Twilio POSTs the transcript here.
fastify.post('/transcription-callback', async (request, reply) => {
  // Twilio sends parameters like TranscriptionText, RecordingUrl, etc.
  const transcriptionText = request.body.TranscriptionText;
  const recordingUrl = request.body.RecordingUrl;
  fastify.log.info('Received transcription callback:', { transcriptionText, recordingUrl });

  // Broadcast the transcription via WebSocket
  const broadcastMsg = JSON.stringify({
    type: 'transcription',
    text: transcriptionText,
    recordingUrl,
    timestamp: new Date().toISOString()
  });
  for (const connection of connections) {
    connection.socket.send(broadcastMsg);
  }
  reply.send({ received: true });
});

// Start the server
try {
  await fastify.listen({ port: fastify.config.PORT, host: '0.0.0.0' });
  console.log(`Server listening on ${fastify.server.address().port}`);
  console.log(`Base URL: ${fastify.config.BASE_URL}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
