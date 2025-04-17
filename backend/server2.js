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
// Import WebSocket client library for Speechmatics connection
import WebSocket from 'ws';

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
    'BASE_URL',
    // Add your Speechmatics token to the required env variables:
    'SPEECHMATICS_API_TOKEN'
  ],
  properties: {
    PORT: { type: 'string', default: '3000' },
    TWILIO_ACCOUNT_SID: { type: 'string' },
    TWILIO_AUTH_TOKEN: { type: 'string' },
    TWILIO_PHONE_NUMBER: { type: 'string' },
    AGENT_NUMBER: { type: 'string' },
    BASE_URL: { type: 'string' },
    SPEECHMATICS_API_TOKEN: { type: 'string' }
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

// In-memory store for WebSocket connections (for broadcasting transcripts)
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

// WebSocket endpoint for broadcasting transcripts to connected browsers
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

// ----------------------
// WebSocket endpoint for Twilio Media Streams (integrated with Speechmatics)
// ----------------------
fastify.register(async function (fastify) {
  fastify.get('/twilio-stream', { websocket: true }, (connection, req) => {
    fastify.log.info('Twilio Media Stream connection established');

    // Buffer for audio samples received before the Speechmatics connection is fully open.
    const queuedAudio = [];

    // Create a WebSocket connection to Speechmatics Streaming API.
    // Note: We're now setting the Authorization header with Bearer token.
    const speechmaticsWs = new WebSocket(
      `wss://eu2.rt.speechmatics.com/v2?type=rt`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SPEECHMATICS_API_TOKEN}`
        }
      }
    );

    // Function to send audio to Speechmatics, buffering if necessary.
    function sendAudio(audioBuffer) {
      if (speechmaticsWs.readyState === WebSocket.OPEN) {
        speechmaticsWs.send(audioBuffer);
      } else if (speechmaticsWs.readyState === WebSocket.CONNECTING) {
        // Buffer audio until connection is open.
        queuedAudio.push(audioBuffer);
      } else {
        fastify.log.warn(`Cannot send audio to Speechmatics - connection not open (state: ${speechmaticsWs.readyState})`);
      }
    }

    // When the Speechmatics connection opens, send your config and flush any queued audio.
    speechmaticsWs.on('open', () => {
      fastify.log.info('Connected to Speechmatics streaming API');

      // Configuration for Speechmatics to handle Twilio's audio format.
      const configMsg = {
        message: "StartRecognition",
        audio_format: {
          type: "raw",
          encoding: "mulaw",    // G.711 μ-law encoding used by Twilio
          sample_rate: 16000     // 8kHz sample rate
        },
        transcription_config: {
          language: "en",
          enable_partials: true,
          max_delay: 2,         // Reduced max delay for faster transcription
          operating_point: "enhanced" // For better accuracy
        }
      };

      fastify.log.debug('Sending configuration to Speechmatics', configMsg);
      speechmaticsWs.send(JSON.stringify(configMsg));

      // Flush any queued audio messages.
      while (queuedAudio.length > 0) {
        const bufferedAudio = queuedAudio.shift();
        speechmaticsWs.send(bufferedAudio);
      }
    });

    // Handle incoming messages from Twilio Media Streams.
    connection.socket.on('message', (message) => {
      try {
        const parsed = JSON.parse(message);
        // Only process messages with the "media" event and payload.
        if (parsed.event === 'media' && parsed.media && parsed.media.payload) {
          // Convert the base64 audio to a Buffer.
          const audioBuffer = Buffer.from(parsed.media.payload, 'base64');
          sendAudio(audioBuffer);
        }
      } catch (err) {
        fastify.log.error(`Error processing Twilio stream message: ${err.message}`, {
          stack: err.stack,
          messagePreview: typeof message === 'string' ? message.substring(0, 100) : 'Non-string message'
        });
      }
    });

    // Handle messages coming from Speechmatics.
    speechmaticsWs.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        fastify.log.debug(`Received message from Speechmatics: ${msg.message || 'unknown type'}`);

        if (msg.message === 'AddTranscript' || msg.message === 'AddPartialTranscript') {
          if (!msg.metadata || !msg.metadata.transcript) {
            fastify.log.warn('Unexpected Speechmatics message format', msg);
            return;
          }
          const transcription = msg.metadata.transcript;
          
          // Create an ID for the transcription - use start_time if available
          // This helps frontend identify the same utterance across multiple partial updates
          const transcriptionId = msg.metadata.start_time || Date.now().toString();
          
          const broadcastMsg = JSON.stringify({
            type: 'transcription',
            text: transcription,
            source: 'speechmatics',
            messageType: msg.message === 'AddTranscript' ? 'final' : 'partial',
            timestamp: new Date().toISOString(),
            transcriptionId: transcriptionId
          });
          // Broadcast to all connected browser clients.
          for (const conn of connections) {
            conn.socket.send(broadcastMsg);
          }
        } else if (msg.message === 'Error') {
          fastify.log.error(`Speechmatics error: ${msg.type || 'Unknown error'} - ${msg.reason || 'No reason provided'}`, msg);
        } else if (msg.message === 'Warning') {
          fastify.log.warn(`Speechmatics warning: ${msg.type || 'Unknown warning'} - ${msg.reason || 'No reason provided'}`, msg);
        } else if (msg.message === 'Info') {
          fastify.log.info(`Speechmatics info: ${msg.type || 'Unknown info'} - ${msg.reason || 'No reason provided'}`, msg);
        } else if (msg.message === 'RecognitionStarted') {
          fastify.log.info(`Speechmatics recognition started with ID: ${msg.id}`);
        } else if (msg.message === 'EndOfTranscript') {
          fastify.log.info('Speechmatics end of transcript received');
          if (speechmaticsWs.readyState === WebSocket.OPEN) {
            speechmaticsWs.close();
          }
        }
      } catch (err) {
        fastify.log.error(`Error processing Speechmatics message: ${err.message}`, {
          stack: err.stack,
          dataPreview: typeof data === 'string' ? data.substring(0, 100) : 'Non-string data'
        });
      }
    });

    // Clean up when the Twilio Media Stream connection closes.
    connection.socket.on('close', () => {
      fastify.log.info('Twilio Media Stream connection closed');
      if (speechmaticsWs.readyState === WebSocket.OPEN) {
        const endOfStreamMsg = {
          message: "EndOfStream",
          last_seq_no: 0
        };
        speechmaticsWs.send(JSON.stringify(endOfStreamMsg));
      } else if (speechmaticsWs.readyState === WebSocket.CONNECTING) {
        speechmaticsWs.close();
      }
    });

    // Handle errors on the Speechmatics connection.
    speechmaticsWs.on('error', (err) => {
      fastify.log.error(`Speechmatics WebSocket error: ${err.message}`, {
        stack: err.stack,
        code: err.code
      });
    });
  });
});

// ----------------------
// Updated Call Endpoint using Media Streams (with Speechmatics)
// ----------------------
fastify.post('/call', async (request, reply) => {
  const phoneNumber = request.body.phoneNumber;
  if (!phoneNumber) {
    return reply.code(400).send({ error: 'Phone number is required' });
  }

  fastify.log.info(`Starting conference call with ${phoneNumber} and ${fastify.config.AGENT_NUMBER}`);

  try {
    const conferenceName = `conference-${Date.now()}`;
    const baseUrl = fastify.config.BASE_URL;
    // Compute the WebSocket URL for Media Streams:
    // Replace http/https with ws/wss accordingly.
    const wsStreamUrl = baseUrl.replace(/^http/, 'ws') + "/twilio-stream";

    // Updated TwiML: add a <Start><Stream> element before the <Dial> so that Twilio
    // sends the raw audio to our /twilio-stream endpoint.
    const customerTwiml = `
      <Response>
        <Say>You are being connected to a conference call.</Say>
        <Start>
          <Stream url="${wsStreamUrl}"/>
        </Start>
        <Dial>
          <Conference record="record-from-start" 
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
        <Start>
          <Stream url="${wsStreamUrl}"/>
        </Start>
        <Dial>
          <Conference record="record-from-start" 
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

// Optional: You may keep the original transcription callback endpoint if needed.
fastify.post('/transcription-callback', async (request, reply) => {
  const transcriptionText = request.body.TranscriptionText;
  const recordingUrl = request.body.RecordingUrl;
  fastify.log.info('Received transcription callback:', { transcriptionText, recordingUrl });

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
