// background.js

// Listen for messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'sendToMem0') {
    sendToMem0(request.data, sendResponse);
    return true; // Indicates we want to use sendResponse asynchronously
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
        "Authorization": "Token m0-abcWVlcO5VyrW9o17XxuhUTud4Xv8LXsG4gm0GDP" // Replace with actual API key
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

