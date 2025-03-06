document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggleBtn');
  const statusDiv = document.getElementById('status');
  
  // Load current state
  chrome.storage.local.get(['enabled'], function(result) {
    const isEnabled = result.enabled || false;
    updateUI(isEnabled);
  });
  
  toggleBtn.addEventListener('click', function() {
    chrome.storage.local.get(['enabled'], function(result) {
      const newState = !(result.enabled || false);
      
      // Save new state
      chrome.storage.local.set({enabled: newState}, function() {
        updateUI(newState);
        
        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0] && tabs[0].url.includes('web.whatsapp.com')) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'toggle', enabled: newState});
          }
        });
      });
    });
  });
  
  function updateUI(isEnabled) {
    if (isEnabled) {
      toggleBtn.textContent = 'Disable Logging';
      statusDiv.textContent = 'Status: Enabled';
      statusDiv.style.color = '#25D366';
    } else {
      toggleBtn.textContent = 'Enable Logging';
      statusDiv.textContent = 'Status: Disabled';
      statusDiv.style.color = '#999';
    }
  }
});
