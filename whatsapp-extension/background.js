// background.js

// Listen for messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'sendToMem0') {
    sendToMem0(request.data, sendResponse);
    return true; // Indicates we want to use sendResponse asynchronously
  }
  
  if (request.action === 'translateToHindi') {
    console.log("Translation request received in background script:", request.text);
    
    // Store the text locally in case of context issues
    const textToTranslate = request.text;
    
    translateToHindi(textToTranslate)
      .then(result => {
        console.log("Translation completed:", result);
        try {
          sendResponse(result);
        } catch (err) {
          console.error("Error sending response:", err);
        }
      })
      .catch(error => {
        console.error("Translation error:", error);
        try {
          sendResponse({ error: error.message || "Translation failed" });
        } catch (err) {
          console.error("Error sending error response:", err);
        }
      });
    
    return true; // Keep the message channel open for async response
  }
});

// Function to send data to mem0 API
async function sendToMem0(data, callback) {
  try {
    console.log("Sending data:", JSON.stringify(data));

    const response = await fetch("https://api.mem0.ai/v1/memories/", {
      method: "POST",  // Explicitly set to POST
      mode: "cors",  // Ensure CORS is handled properly (especially for browser requests)
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Token m0-ZQKZZ9a1LrEsN6ref2tjweXHXrhXRn2yCyyGlyxj" // Replace with actual API key
      },
      body: JSON.stringify(data)
    });

    console.log("Response method:", response.url, response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      callback({ error: `HTTP error! status: ${response.status}, details: ${errorText}` });
      return;
    }

    const responseData = await response.json();
    callback({ success: true, data: responseData });
  } catch (error) {
    console.error("Error sending to mem0:", error);
    callback({ error: error.message });
  }
}

// Updated function to translate text to Hindi using Gemini Flash API
// Updated function to translate text to Hindi using Gemini 1.5 Flash API
function translateToHindi(text) {
  return new Promise((resolve, reject) => {
    console.log("Starting translation process for:", text);
    
    fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": "AIzaSyC2pko5GzzlwD4q2amHm3Bzxjej4yt6sbo"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Translate the following text to Hindi. Return only the translated text without any explanations or additional text:\n\n${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024
        }
      })
    })
    .then(response => {
      console.log("API response status:", response.status);
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`API error (${response.status}): ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log("API response data:", data);
      
      // Extract the translated text
      if (data.candidates && 
          data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts.length > 0) {
        
        const translation = data.candidates[0].content.parts[0].text;
        console.log("Extracted translation:", translation);
        resolve({ success: true, translation });
      } else {
        console.error("Unexpected API response structure:", data);
        reject(new Error("Could not extract translation from API response"));
      }
    })
    .catch(error => {
      console.error("Translation API error:", error);
      reject(error);
    });
  });
}

// Add a listener for extension installation or update
chrome.runtime.onInstalled.addListener(function() {
  console.log('WhatsApp Message Logger extension installed or updated');
  
  // Initialize extension settings
  chrome.storage.local.get(['enabled'], function(result) {
    if (result.enabled === undefined) {
      chrome.storage.local.set({enabled: false, firstRun: true});
    }
  });
});

// Handle extension errors
chrome.runtime.onConnect.addListener(function(port) {
  port.onDisconnect.addListener(function() {
    if (chrome.runtime.lastError) {
      console.log('Port disconnected due to error:', chrome.runtime.lastError.message);
    }
  });
});