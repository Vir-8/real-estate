// content.js

let isEnabled = false;
let observerActive = false;
let observer = null;
let processedMessages = new Set();
let translatedMessages = new Set(); // Track messages that already have translation buttons

// Helper to check if Chrome runtime is available
function isChromeRuntimeAvailable() {
  return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggle') {
    isEnabled = request.enabled;
    
    if (isEnabled && !observerActive) {
      startObserver();
    } else if (!isEnabled && observerActive) {
      stopObserver();
    }
    
    sendResponse({status: 'ok'});
  }
  return true;
});

// Check if we should show the initial popup
chrome.storage.local.get(['firstRun'], function(result) {
  // First time running the extension
  setTimeout(showInitialPopup, 3000); // Wait for WhatsApp to load
});

function showInitialPopup() {
  if (!document.querySelector('.whatsapp-logger-popup')) {
    const popup = document.createElement('div');
    popup.className = 'whatsapp-logger-popup';
    popup.style.cssText = `
      color: #616161;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: Arial, sans-serif;
      max-width: 300px;
      text-align: center;
    `;
    
    popup.innerHTML = `
      <h3 style="margin-top: 0;">WhatsApp Message Logger</h3>
      <p>Would you like to enable message logging to mem0?</p>
      <div style="display: flex; justify-content: space-between; margin-top: 15px;">
        <button id="enableBtn" style="background: #25D366; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; flex: 1; margin-right: 5px;">Enable</button>
        <button id="disableBtn" style="background: #ccc; color: black; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; flex: 1; margin-left: 5px;">Not Now</button>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    document.getElementById('enableBtn').addEventListener('click', function() {
      isEnabled = true;
      chrome.storage.local.set({enabled: true});
      startObserver();
      popup.remove();
    });
    
    document.getElementById('disableBtn').addEventListener('click', function() {
      chrome.storage.local.set({enabled: false});
      popup.remove();
    });
  }
}

// Function to get current chat name
function getCurrentChatName() {
  try {
    // Find the profile details div
    const profileDetailsDiv = document.querySelector('div[title="Profile details"]');
    
    if (profileDetailsDiv) {
      // Get the sibling div with role="button" that contains the chat name
      const chatNameDiv = profileDetailsDiv.parentElement.querySelectorAll('div[role="button"]')[1];
      
      if (chatNameDiv) {
        // Find the deepest span with the actual text
        const allSpans = chatNameDiv.querySelectorAll('span');
        
        // Loop through all spans to find the one with text content
        for (const span of allSpans) {
          if (span.innerText && span.innerText.trim() && !span.querySelector('*')) {
            return span.innerText.trim();
          }
        }
        
        // Fallback: return the text content of the button div itself
        return chatNameDiv.innerText.trim();
      }
    }
    
    // Additional fallback: try other selectors if the above didn't work
    // This checks the header area for elements that might contain the chat name
    const headerTitleSpan = document.querySelector('header span[dir="auto"][aria-label]');
    if (headerTitleSpan) {
      return headerTitleSpan.innerText.trim();
    }
    
    return "Unknown Chat";
  } catch (e) {
    console.error('Error getting chat name:', e);
    return "Unknown Chat";
  }
}

// Improved function to check if a message is outgoing
function isMessageOutgoing(messageElement) {
  try {
    // Method 1: Direct class check on the message element
    if (messageElement.classList.contains('message-out')) {
      return true;
    }
    
    // Method 2: Check if any parent has the message-out class
    // This is necessary because the class might be on a parent element
    let parentElement = messageElement.parentElement;
    let checkDepth = 0;
    const MAX_DEPTH = 5; // Limit how far up we check to avoid performance issues
    
    while (parentElement && checkDepth < MAX_DEPTH) {
      if (parentElement.classList && parentElement.classList.contains('message-out')) {
        return true;
      }
      parentElement = parentElement.parentElement;
      checkDepth++;
    }
    
    // Method 3: Check for specific attributes or structures that indicate outgoing messages
    // In some WhatsApp versions, outgoing messages have specific data attributes or structures
    if (messageElement.querySelector('[data-icon="tail-out"]') || 
        messageElement.closest('[data-is-author="true"]')) {
      return true;
    }
    
    // Method 4: Check for specific positioning (outgoing messages are usually on the right)
    const msgStyle = window.getComputedStyle(messageElement);
    if (msgStyle.marginLeft === 'auto' || msgStyle.alignSelf === 'flex-end') {
      return true;
    }
    
    // Method 5: Try to find the bubble container which might have the class
    const bubbleContainer = messageElement.querySelector('.message-in, .message-out');
    if (bubbleContainer && bubbleContainer.classList.contains('message-out')) {
      return true;
    }
    
    // Add to the console for debugging purposes
    console.debug('Message not identified as outgoing:', messageElement);
    
    return false;
  } catch (e) {
    console.error('Error checking if message is outgoing:', e);
    return false; // Default to assuming it's incoming if there's an error
  }
}

// Function to send message to mem0 via background script
function sendToMem0(sender, messageText, isOutgoing) {
  // Check if Chrome runtime is available
  if (!isChromeRuntimeAvailable()) {
    console.error('Extension context invalidated. Cannot send to mem0.');
    return;
  }
  
  // Get the first word of sender for user_id as requested
  const user_id = isOutgoing ? "real_estate_agent" : sender.split(' ')[0];

  // Create payload in the required format
  const memoryData = {
    "messages": [
      {
        "role": "user",
        "content": messageText
      }
    ],
    "user_id": user_id
  };

  // Send to background script to handle the API call
  chrome.runtime.sendMessage({
    action: 'sendToMem0',
    data: memoryData
  }, function(response) {
    if (!isChromeRuntimeAvailable()) return;
    
    if (chrome.runtime.lastError) {
      console.error('Error sending to background:', chrome.runtime.lastError);
    } else if (response && response.error) {
      console.error('Error from mem0:', response.error);
    } else {
      console.log('Message sent for memory creation:', response);
    }
  });
}

// Function to add translation button to an incoming message
function addTranslationButton(messageElement, messageText, msgId) {
  // Skip if we've already added a button to this message
  if (translatedMessages.has(msgId)) return;
  
  try {
    // Find the container where we'll add our button
    const contentContainer = messageElement.querySelector('.copyable-text');
    if (!contentContainer) return;
    
    // Create the translation button
    const translateButton = document.createElement('button');
    translateButton.className = 'translate-to-hindi-btn';
    translateButton.textContent = 'Translate to Hindi';
    translateButton.style.cssText = `
      background: #128C7E;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 12px;
      margin-top: 5px;
      cursor: pointer;
      display: block;
    `;
    
    // Create a container for the translation result
    const translationContainer = document.createElement('div');
    translationContainer.className = 'hindi-translation';
    translationContainer.style.cssText = `
      margin-top: 5px;
      font-style: italic;
      color: rgb(19, 223, 200);
      display: none;
    `;
    
    // Updated event listener with extensive error handling and logging
    translateButton.addEventListener('click', function() {
      // Show loading state
      translationContainer.style.display = 'block';
      translationContainer.textContent = 'Translating...';
      
      console.log("Translation button clicked for text:", messageText);
      
      try {
        // Check if Chrome runtime is available before sending message
        if (!isChromeRuntimeAvailable()) {
          console.error("Chrome runtime not available");
          translationContainer.textContent = 'Extension context invalidated. Please refresh the page.';
          return;
        }
        
        // Request translation via background script
        chrome.runtime.sendMessage({
          action: 'translateToHindi',
          text: messageText
        }, function(response) {
          console.log("Translation response received:", response);
          
          // Handle response
          if (chrome.runtime.lastError) {
            console.error("Runtime error:", chrome.runtime.lastError);
            translationContainer.textContent = 'Translation error: ' + chrome.runtime.lastError.message;
          } else if (!response) {
            console.error("Empty response");
            translationContainer.textContent = 'No translation response received';
          } else if (response.error) {
            console.error("Error in response:", response.error);
            translationContainer.textContent = 'Translation failed: ' + response.error;
          } else if (response.translation) {
            console.log("Setting translation:", response.translation);
            translationContainer.textContent = response.translation.trim();
            translationContainer.style.fontWeight = 'normal';
            translationContainer.style.color = 'rgb(19, 223, 200)';
          } else {
            console.error("Unexpected response format:", response);
            translationContainer.textContent = 'Translation failed: Invalid response format';
          }
        });
      } catch (error) {
        console.error("Error in translation click handler:", error);
        translationContainer.textContent = 'Translation error: ' + error.message;
      }
    });
    
    // Add button and container to the message
    contentContainer.parentNode.appendChild(translateButton);
    contentContainer.parentNode.appendChild(translationContainer);
    
    // Mark this message as having a translation button
    translatedMessages.add(msgId);
    
  } catch (e) {
    console.error('Error adding translation button:', e);
  }
}

function startObserver() {
  if (observerActive) return;
  
  // Create a new observer instance
  observer = new MutationObserver(function(mutations) {
    if (!isEnabled) return;
    
    // Process only if we're on WhatsApp Web
    if (!window.location.href.includes('web.whatsapp.com')) return;
    
    try {
      // Look for new messages
      const messages = document.querySelectorAll('[data-id]');
      
      // Process each message
      messages.forEach(msg => {
        // Generate a unique ID for this message to avoid duplicates
        const msgId = msg.getAttribute('data-id');
        
        // Skip if we've already processed this message
        if (processedMessages.has(msgId)) return;
        
        // Find the text content of the message
        const textElement = msg.querySelector('.selectable-text');
        if (!textElement) return;
        
        const messageText = textElement.innerText.trim();
        if (!messageText) return;
        
        // Only process newly arrived messages
        // We check if this is a "recent" message by looking at its position
        const msgContainer = msg.closest('[role="row"]');
        if (!msgContainer || !msgContainer.parentElement) return;
        
        const childNodes = Array.from(msgContainer.parentElement.children);
        const index = childNodes.indexOf(msgContainer);
        
        // Only log if this is one of the last few messages
        if (index >= childNodes.length - 5) {
          // Use improved method to determine if message is outgoing
          const isOutgoing = isMessageOutgoing(msg);
          
          // Get sender info for incoming messages
          let sender = "You";
          if (!isOutgoing) {
            // Use the chat name method
            sender = getCurrentChatName();
            
            // Add translation button for incoming messages
            addTranslationButton(msg, messageText, msgId);
          }
          
          // Log to console with direction indicator for debugging
          console.log(`${sender}: ${messageText}`);
          
          // Send to mem0
          sendToMem0(sender, messageText, isOutgoing);
          
          // Add to processed set
          processedMessages.add(msgId);
          
          // Keep the set size reasonable
          if (processedMessages.size > 200) {
            const entries = Array.from(processedMessages);
            processedMessages = new Set(entries.slice(entries.length - 100));
          }
        }
      });
    } catch (e) {
      console.error('WhatsApp Logger error:', e);
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
  
  observerActive = true;
  console.log('WhatsApp Message Logger with mem0: Started');
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observerActive = false;
    console.log('WhatsApp Message Logger: Stopped');
  }
}

// Handle chat switches - monitor URL changes
let lastUrl = location.href; 
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    // Clear processed messages when changing chats
    processedMessages.clear();
    translatedMessages.clear(); // Also clear translation buttons tracking
  }
}).observe(document, {subtree: true, childList: true});