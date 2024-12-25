const form = document.querySelector('.form1');

// Check for stored API key when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  const storedKey = await chrome.storage.local.get('APIKEY');
  if (storedKey.APIKEY) {
    console.log('Stored API Key:', storedKey.APIKEY);
    // Optionally populate the input field with the stored key
    const apiKeyElement = document.getElementById('AK1010');
    apiKeyElement.value = storedKey.APIKEY;
  } else {
    console.log('No API Key found in storage.');
  }
});

// Handle form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const apiKeyElement = document.getElementById('AK1010');
  const apiKey = apiKeyElement.value;
  handleAPIkey(apiKey);
});

async function handleAPIkey(apiKey) {
  if (apiKey) {
    await chrome.storage.local.set({ APIKEY: apiKey });
    console.log('API Key saved:', apiKey);
    
    chrome.runtime.sendMessage({ type: 'SEND_API_KEY', apiKey });
  }
}
