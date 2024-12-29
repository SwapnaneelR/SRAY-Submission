
const validApiKey = 'AIzaSyAptP95baweFFbFrQnSQQTGADLimeOFVaY';
const submitButton = document.getElementById('submit-button');
const inputField = document.getElementById('api-key-input');
const message = document.getElementById('message');

// Enable/Disable the button based on input
inputField.addEventListener('input', () => {
    submitButton.disabled = !inputField.value.trim();
});

// Handle form submission
submitButton.addEventListener('click', () => {
    const apiKey = inputField.value.trim();

    // Store the valid API key in Chrome storage
    chrome.storage.local.set({ apiKey: apiKey }, () => {
      message.textContent = 'API Key is valid! You can now use the chatbot.';
      inputField.disabled = true;
      submitButton.disabled = true;
      if (apiKey === validApiKey) {
        message.textContent = 'API Key is valid! You can now use the chatbot.';
        message.style.color = 'green';

      }
      else {
      message.textContent = 'API Key is invalid! You cannot use the chatbot.';
        message.style.color = 'red';

       }
  })

});