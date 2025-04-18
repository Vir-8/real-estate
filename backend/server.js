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
// Import WebSocket client library for Deepgram connection
import WebSocket from 'ws';
// Import our transcript processing module
import { processRealEstateConversation } from './processTranscript.js';

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

// Define environment schema (update required token to DEEPGRAM_API_KEY)
const schema = {
  type: 'object',
  required: [
    'PORT',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'AGENT_NUMBER',
    'BASE_URL',
    'DEEPGRAM_API_KEY'
  ],
  properties: {
    PORT: { type: 'string', default: '3000' },
    TWILIO_ACCOUNT_SID: { type: 'string' },
    TWILIO_AUTH_TOKEN: { type: 'string' },
    TWILIO_PHONE_NUMBER: { type: 'string' },
    AGENT_NUMBER: { type: 'string' },
    BASE_URL: { type: 'string' },
    DEEPGRAM_API_KEY: { type: 'string' },
    DEEPGRAM_KEYWORDS: { type: 'string', default: '' }
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
// WebSocket endpoint for Twilio Media Streams (integrated with Deepgram)
// ----------------------
fastify.register(async function (fastify) {
  fastify.get('/twilio-stream', { websocket: true }, (connection, req) => {
    fastify.log.info('Twilio Media Stream connection established');

    // Buffer for audio samples received before the Deepgram connection is fully open.
    const queuedAudio = [];

    // Define custom vocabulary for real estate in India
    const additionalVocab = [
      // Indian locations - major cities
      "Mumbai", "Delhi", "Bangalore", "Kolkata", "Chennai", "Hyderabad",
      "Pune", "Ahmedabad", "Surat", "Jaipur",
      
      // Mumbai neighborhoods
      "Juhu", "Bandra", "Worli", "Andheri", "Colaba", "Powai", "Borivali", 
      "Thane", "Navi Mumbai", "Malad", "Goregaon", "Chembur", "Dadar", 
      "Khar", "Santacruz", "Versova", "Churchgate", "Fort", "Nariman Point",
      
      // Indian English financial terms
      "crore", "lakh", "rupee", "rupees", "paise",
      "EMI", "loan", "mortgage", "downpayment", "booking amount",
      
      // Real estate terms
      "BHK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK",
      "square feet", "sq ft", "sqft", "carpet area", "built-up area", "super built-up area",
      "duplex", "penthouse", "flat", "apartment", "villa", "bungalow",
      "property", "real estate", "broker", "agent", "builder", "developer",
      "society", "complex", "gated community", "township",
      
      // Common Indian real estate terms
      "registration", "stamp duty", "possession", "ready possession",
      "under construction", "floor rise", "corpus fund", "maintenance",
      "tenant", "landlord", "owner", "resale", "amenities", "parking",
      "power backup", "gym", "swimming pool", "garden", "clubhouse"
    ];

    // Combine environment variable keywords with hardcoded vocabulary
    let keywords = additionalVocab;
    if (fastify.config.DEEPGRAM_KEYWORDS && fastify.config.DEEPGRAM_KEYWORDS.trim() !== '') {
      const envKeywords = fastify.config.DEEPGRAM_KEYWORDS.split(',').map(k => k.trim());
      keywords = [...new Set([...keywords, ...envKeywords])]; // Combine and deduplicate
    }

    // Convert keywords array to comma-separated string for Deepgram
    const keywordsParam = keywords.length > 0 ? 
      `&keywords=${encodeURIComponent(keywords.join(','))}` : '';

    // Create a WebSocket connection to Deepgram Streaming API.
    // Configuration is provided via query parameters:
    // - encoding: "mulaw" (G.711 μ-law as used by Twilio)
    // - sample_rate: 8000 (as specified for Twilio)
    // - language: "hi" (Hindi)
    // - punctuate: true (for adding punctuation)
    // - interim_results: false (only get final results)
    // - keywords: custom keywords to improve recognition (comma-separated)
    const deepgramWs = new WebSocket(
      `wss://api.deepgram.com/v1/listen?encoding=mulaw&sample_rate=8000&language=hi&punctuate=true&interim_results=false${keywordsParam}`,
      {
        headers: {
          'Authorization': `Token ${fastify.config.DEEPGRAM_API_KEY}`
        }
      }
    );

    // Function to send audio to Deepgram, buffering if necessary.
    function sendAudio(audioBuffer) {
      if (deepgramWs.readyState === WebSocket.OPEN) {
        deepgramWs.send(audioBuffer);
      } else if (deepgramWs.readyState === WebSocket.CONNECTING) {
        // Buffer audio until connection is open.
        queuedAudio.push(audioBuffer);
      } else {
        fastify.log.warn(`Cannot send audio to Deepgram - connection not open (state: ${deepgramWs.readyState})`);
      }
    }

    // When the Deepgram connection opens, flush any queued audio.
    deepgramWs.on('open', () => {
      fastify.log.info('Connected to Deepgram streaming API');
      while (queuedAudio.length > 0) {
        const bufferedAudio = queuedAudio.shift();
        deepgramWs.send(bufferedAudio);
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

    // Handle messages coming from Deepgram.
    deepgramWs.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        // Deepgram returns a structure with a "channel" property.
        if (msg.channel && msg.channel.alternatives && msg.channel.alternatives.length > 0) {
          const transcript = msg.channel.alternatives[0].transcript;
          // Determine if the result is final or partial using Deepgram's "is_final" flag.
          const messageType = msg.channel.is_final ? 'final' : 'partial';
          // Use a simple timestamp-based ID (adjust as needed).
          const transcriptionId = Date.now().toString();
          
          fastify.log.info(`Received transcript from Deepgram: ${transcript} (${messageType})`);
          
          const broadcastMsg = JSON.stringify({
            type: 'transcription',
            text: transcript,
            source: 'deepgram',
            messageType: messageType,
            timestamp: new Date().toISOString(),
            transcriptionId: transcriptionId
          });
          
          // Broadcast to all connected browser clients.
          for (const conn of connections) {
            conn.socket.send(broadcastMsg);
            fastify.log.info(`Sent transcript to client: ${transcript}`);
          }
        }
      } catch (err) {
        fastify.log.error(`Error processing Deepgram message: ${err.message}`, {
          stack: err.stack,
          dataPreview: typeof data === 'string' ? data.substring(0, 100) : 'Non-string data'
        });
      }
    });

    // Clean up when the Twilio Media Stream connection closes.
    connection.socket.on('close', () => {
      fastify.log.info('Twilio Media Stream connection closed');
      if (deepgramWs.readyState === WebSocket.OPEN || deepgramWs.readyState === WebSocket.CONNECTING) {
        deepgramWs.close();
      }
      
      // Send conference end status to all connected clients
      const endMsg = JSON.stringify({
        type: 'conference_status',
        status: 'ended',
        conferenceName: 'conference-' + Date.now(),
        timestamp: new Date().toISOString()
      });
      
      fastify.log.info('Sending conference end status to clients');
      for (const conn of connections) {
        conn.socket.send(endMsg);
      }
    });

    // Handle errors on the Deepgram connection.
    deepgramWs.on('error', (err) => {
      fastify.log.error(`Deepgram WebSocket error: ${err.message}`, {
        stack: err.stack,
        code: err.code
      });
    });
  });
});

// ----------------------
// Updated Call Endpoint using Media Streams (with Deepgram)
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

// Add new endpoint for processing transcripts
fastify.post('/process-transcript', async (request, reply) => {
  const { transcripts } = request.body;
  
  if (!transcripts || !Array.isArray(transcripts)) {
    return reply.code(400).send({ error: 'Transcripts array is required' });
  }
  
  try {
    // Convert array of transcript objects to a single string for processing
    const transcriptTexts = transcripts.map(t => {
      // Include speaker info if available
      if (t.participant) {
        return `${t.participant}: ${t.text}`;
      }
      return t.text;
    });
    
    // Process the transcripts
    const result = await processRealEstateConversation(transcriptTexts);
    
    fastify.log.info(`Processed ${transcripts.length} transcript entries`);
    
    return {
      success: true,
      structuredData: result.structuredData,
      formattedOutput: result.formattedOutput
    };
  } catch (error) {
    fastify.log.error(error, 'Failed to process transcripts');
    return reply.code(500).send({ error: error.message });
  }
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
