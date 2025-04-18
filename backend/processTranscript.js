import { GoogleGenerativeAI } from '@google/generative-ai';
import MemoryClient from 'mem0ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure Mem0AI
const mem0 = new MemoryClient({ 
  apiKey: process.env.MEM0_API_KEY,
});

/**
 * Returns configuration for speech recognition optimized for Indian real estate conversations
 * @returns {Object} Configuration object
 */
function getSpeechRecognitionConfig() {
    return {
    domain: "conversational", // Optimized for dialog
    enableConfidenceScores: true, // Enable word-level confidence
    // Comprehensive Indian English vocabulary and real estate terms
    additionalVocab: [
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
        ]
  };
}

/**
 * Parse real estate conversation transcription between agent and client
 * @param {string|Array} inputText - String or array of the transcribed conversation
 * @returns {Promise<Object>} Structured conversation with speaker labels
 */
async function parseTranscription(inputText) {
  // If input is a list/array, convert to string
  if (Array.isArray(inputText)) {
    inputText = inputText.join(' ');
  } else if (typeof inputText === 'string' && inputText.startsWith('[') && inputText.endsWith(']')) {
    // Handle string representation of array
    try {
      // Try to parse as JSON array
      const arrayContent = JSON.parse(inputText);
      if (Array.isArray(arrayContent)) {
        inputText = arrayContent.join(' ');
      }
    } catch (error) {
      // If not valid JSON, remove brackets and handle as string
      inputText = inputText.substring(1, inputText.length - 1).replace(/["']/g, '');
    }
  }
  
  // Clean up input text
  inputText = inputText.trim();
  
  // Use Gemini to parse the conversation with enhanced prompting
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  // Enhanced prompt with specific real estate domain knowledge and examples
  const prompt = `
    # Real Estate Conversation Analysis Task

    ## Context
    You are parsing a conversation transcript between a real estate agent and a client in India. 
    Your task is to accurately identify and separate each person's dialogue turns.
    
    ## Input Transcript
  \`\`\`
  ${inputText}
  \`\`\`
    
    ## Instructions
    1. Parse the above transcript into clear, distinct speaking turns
    2. Label each speaking turn correctly as either "Client" or "Agent" 
    3. Pay special attention to cues like:
       - Client typically mentions requirements, budget, preferences
       - Agent typically asks questions, offers options, discusses properties
    4. Be robust to transcription errors in:
       - Real estate terms (e.g., "bbk" should be "bhk", "carpet eria" should be "carpet area")
       - Location names (e.g., "mumai" should be "Mumbai", "banda" should be "Bandra")
       - Financial terms (e.g., "80 lac" means "80 lakh", "2 cr" means "2 crore")
    5. Use conversational context to determine the speaker when explicit markers are missing
    
    ## Common Real Estate Conversation Patterns
    - Client often starts with introduction or stating requirements
    - Agent often responds with greetings or clarifying questions
    - Client mentions preferences (location, size, budget)
    - Agent inquires about specific details or offers options
    
    ## Output Format
    Provide your answer as a JSON object with this structure:
  \`\`\`json
  {
        "conversation": [
          {"speaker": "Client", "text": "..."},
          {"speaker": "Agent", "text": "..."},
            ...
        ]
  }
  \`\`\`
    
    Only include the JSON in your response, with no additional text.
  `;
  
  try {
    // Generate content with Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Try to extract JSON from the response
    let jsonText = responseText;
    
    // Find JSON block if surrounded by markdown code fences
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
      
    // Parse the JSON
    const parsedResult = JSON.parse(jsonText);
    
    // Validate structure
    if (!parsedResult.conversation || !Array.isArray(parsedResult.conversation)) {
      throw new Error("Invalid response structure");
    }
      
    // Post-process to correct common errors
    for (const turn of parsedResult.conversation) {
      turn.text = correctRealEstateTerms(turn.text);
    }
      
    return parsedResult;
  } catch (error) {
    console.error("Error parsing with Gemini:", error);
    // Fallback to regex pattern matching if Gemini doesn't return valid JSON
    return fallbackParse(inputText);
  }
}

/**
 * Fallback method using regex pattern matching for when the AI parser fails
 * @param {string} inputText - The input conversation text
 * @returns {Object} Structured conversation
 */
function fallbackParse(inputText) {
  const conversation = [];
  
  // Case 1: Clear Client/Agent markers
  if (/Client\s*:|Agent\s*:/i.test(inputText)) {
    // Extract marked segments
    const segments = inputText.split(/(Client\s*:|Agent\s*:)/i);
    const filteredSegments = segments.filter(s => s.trim() !== '');
    
    let currentSpeaker = null;
    let currentText = "";
    
    for (const segment of filteredSegments) {
      if (/Client\s*:/i.test(segment)) {
        // Save previous segment if exists
        if (currentSpeaker && currentText) {
          conversation.push({"speaker": currentSpeaker, "text": currentText.trim()});
        }
        currentSpeaker = "Client";
        currentText = "";
      } else if (/Agent\s*:/i.test(segment)) {
        // Save previous segment if exists
        if (currentSpeaker && currentText) {
          conversation.push({"speaker": currentSpeaker, "text": currentText.trim()});
        }
        currentSpeaker = "Agent";
        currentText = "";
      } else {
        currentText += segment;
      }
    }
    
    // Add the last segment
    if (currentSpeaker && currentText) {
      conversation.push({"speaker": currentSpeaker, "text": currentText.trim()});
    }
  } else {
    // Case 2: Conversation pattern heuristics
    // Common patterns in real estate conversations
    const clientIndicators = [
      /\bi am\b/i, /\bmy name is\b/i, /\blooking for\b/i, 
      /\bi want\b/i, /\bi need\b/i, /\bi would like\b/i,
      /\bmy budget\b/i, /\binterested in\b/i
    ];
    
    const agentIndicators = [
      /\bhi sir\b/i, /\bhello sir\b/i, /\bokay\b/i, /\bdo you\b/i,
      /\bwould you\b/i, /\bwe have\b/i, /\bi can show\b/i,
      /\bavailable\b/i, /\bproperty\b/i, /\boption\b/i
    ];
    
    // Process based on commas, periods and question marks
    const segments = inputText.split(/([,.?])/);
    const bufferSegments = [];
        
    for (let i = 0; i < segments.length; i += 2) {
      if (i < segments.length) {
        const segment = segments[i];
        const punct = (i+1 < segments.length) ? segments[i+1] : "";
        bufferSegments.push(segment + punct);
      }
    }
    
    if (bufferSegments.length === 0) {
      bufferSegments.push(inputText);
    }
    
    let currentSpeaker = null;
    let buffer = "";
    
    for (const segment of bufferSegments) {
      if (!segment.trim()) {
        continue;
      }
        
      // Determine likely speaker based on content
      const isClient = clientIndicators.some(pattern => pattern.test(segment));
      const isAgent = agentIndicators.some(pattern => pattern.test(segment));
      
      // If clear signal of speaker change, create new turn
      if ((isClient && currentSpeaker !== "Client") || (isAgent && currentSpeaker !== "Agent")) {
        if (buffer) {
          conversation.push({"speaker": currentSpeaker, "text": buffer.trim()});
          buffer = "";
        }
        
        currentSpeaker = isClient ? "Client" : "Agent";
      }
      
      // If first segment, guess speaker
      if (!currentSpeaker) {
        // Default to client starting the conversation
        currentSpeaker = isClient || !isAgent ? "Client" : "Agent";
      }
            
      buffer += " " + segment;
    }
    
    // Add final buffer
    if (buffer && currentSpeaker) {
      conversation.push({"speaker": currentSpeaker, "text": buffer.trim()});
    }
    
    // If still no conversation parsed, make simple alternating split
    if (conversation.length === 0) {
      // Try to identify the boundary between client and agent
      // Common patterns like "I am [Name]" followed by "Okay Hi Sir"
      const match = inputText.match(/(.*?\b(?:i am|my name is).*?)(\bokay\b|\bhello\b|\bhi\b|\bgood\b).*/i);
            
      if (match) {
        conversation.push({"speaker": "Client", "text": match[1].trim()});
        conversation.push({"speaker": "Agent", "text": match[2] + match[0].substring(match.index + match[2].length).trim()});
      } else {
        // Last resort: split by commas and alternate speakers
        const parts = inputText.split(',');
        let isClient = true;  // Assume client speaks first
                
        for (const part of parts) {
          if (part.trim()) {
            conversation.push({"speaker": isClient ? "Client" : "Agent", "text": part.trim()});
            isClient = !isClient;
          }
        }
      }
    }
  }
  
  // Apply corrections to all segments
  for (const turn of conversation) {
    turn.text = correctRealEstateTerms(turn.text);
  }
    
  return {"conversation": conversation};
}

/**
 * Correct common real estate term misspellings in Indian context
 * @param {string} text - The text to correct
 * @returns {string} Corrected text
 */
function correctRealEstateTerms(text) {
  const corrections = {
    // BHK variations
    'b+h+k+': 'BHK',
    // City names
    'mumai': 'Mumbai',
    'bombay': 'Mumbai',
    'bangalor': 'Bangalore',
    'bangalore': 'Bangalore',
    'deli': 'Delhi',
    'delhi': 'Delhi',
    
    // Mumbai areas
    'banda': 'Bandra',
    'woli': 'Worli',
    'juhu': 'Juhu',
    'colaba': 'Colaba',
    'powai': 'Powai',
    
    // Property features
    'see\\s*facing': 'sea facing',
    'sea\\s*face': 'sea facing',
    'see\\s*face': 'sea facing',
    
    // Area measurements
    'sq\\s*ft': 'sq ft',
    'sq\\s*feet': 'sq ft',
    'square\\s*ft': 'sq ft',
    'square\\s*feet': 'sq ft',
    
    // Financial terms
    'lac': 'lakh',
    'lakh': 'lakh',
    'cr': 'crore',
    'crores': 'crore',
    
    // Property types
    'appartment': 'apartment',
    'flatt': 'flat',
    'bungelow': 'bungalow',
    'pent\\s*house': 'penthouse'
  };
  
  let corrected = text;
  
  for (const [pattern, replacement] of Object.entries(corrections)) {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    corrected = corrected.replace(regex, replacement);
  }
  
  // Special case for "X BHK" pattern
  corrected = corrected.replace(/(\d)\s*b+h+k+\b/gi, (match, digit) => `${digit} BHK`);
  
  return corrected;
}

/**
 * Format the conversation in a readable way
 * @param {Object} parsedResult - The parsed conversation result
 * @returns {string} Formatted conversation string
 */
function formatConversation(parsedResult) {
  let output = "";
  for (const turn of parsedResult.conversation) {
    output += `${turn.speaker} : ${turn.text}\n`;
  }
  return output;
}

/**
 * Process and format a real estate conversation transcript
 * @param {string|Array} inputText - The conversation transcript
 * @returns {Promise<Object>} Result with structured data and formatted output
 */
async function processRealEstateConversation(inputText) {
  try {
    // Convert transcript entries to mem0ai message format
    const messages = inputText.map(entry => ({
      role: entry.participant === 'client' ? 'user' : 'assistant',
      content: entry.text
    }));
    
    console.log('Processing messages with mem0ai:', messages);
    
    // Add messages to mem0ai
    await mem0.add(messages, user_id="real_estate_client");
    
    // Get the processed conversation
    const processed = await mem0.get(user_id="real_estate_client");
    
    // Format the conversation for display
    const formatted = processed.messages.map(msg => ({
      speaker: msg.role === 'user' ? 'Client' : 'Agent',
      text: msg.content
    }));
    
    return {
      structuredData: {
        conversation: formatted
      },
      formattedOutput: formatted.map(turn => `${turn.speaker}: ${turn.text}`).join('\n')
    };
  } catch (error) {
    console.error('Error processing with mem0ai:', error);
    throw error;
  }
}

export { 
  getSpeechRecognitionConfig,
  parseTranscription,
  correctRealEstateTerms,
  formatConversation,
  processRealEstateConversation
};
