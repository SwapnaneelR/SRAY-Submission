// content.js
// Author: Swapnaneel Ray

const mainbtnImg = chrome.runtime.getURL("assets/save.png");

let lastVis = "";

function isPageChange() {
    const currPage = window.location.pathname;
    if (currPage === lastVis) {
        return false;
    } else {
        lastVis = currPage;
        return true;
    }
}

function checkPageChange(forceCheck = false) {
    if (!forceCheck && !isPageChange()) return;

    if (isOnProblemsPath()) {
        extractProblemDetails();
        addMainButton();
    }
}

function isOnProblemsPath() {
    const pathname = window.location.pathname;
    return pathname.startsWith('/problems');
}

function observeUrlChanges() {
    const observer = new MutationObserver(() => {
        checkPageChange(true);
    });

    // Observe changes in the body or document for dynamic changes
    observer.observe(document.body, { childList: true, subtree: true });

    checkPageChange(true);
}

function addMainButton() {
    if (document.getElementById('main-button')) return;

    const mainButton = document.createElement('button');
    mainButton.id = 'main-button';
    mainButton.className = 'view-content-btn';
    mainButton.style.display = 'flex';
    mainButton.style.alignItems = 'center';
    mainButton.style.justifyContent = 'center';
    mainButton.style.padding = '8px 16px';
    mainButton.style.border = '0.2px solid white';
    mainButton.style.borderRadius = '5px';
    mainButton.style.backgroundColor = '#2B384E';
    mainButton.style.color = '#f8f9fa';
    mainButton.style.fontSize = '14px';
    mainButton.style.cursor = 'pointer';
    mainButton.style.transition = 'background-color 0.3s, transform 0.3s';
    mainButton.style.margin = '17px';

    const img = document.createElement('img');
    img.src = mainbtnImg;
    img.style.height = '20px';
    img.style.width = '20px';
    img.style.marginRight = '8px';
    mainButton.appendChild(img);

    const txt = document.createElement('span');
    txt.innerHTML = 'AI Help!';
    mainButton.appendChild(txt);

    mainButton.onmouseover = () => {
        mainButton.style.backgroundColor = '#495057';
        mainButton.style.transform = 'scale(1.05)';
    };
    mainButton.onmouseout = () => {
        mainButton.style.backgroundColor = '#2B384E';
        mainButton.style.transform = 'scale(1)';
    };

    const askDoubtButton = document.getElementsByClassName('coding_desc_container__gdB9M')[0];
    if (askDoubtButton) {
        askDoubtButton.insertAdjacentElement('afterend', mainButton);
    } else {
        console.error("Element with the specified class not found.");
    }

    mainButton.addEventListener('click', toggleChatbot);
}
function toggleChatbot() {
    let chatbot = document.getElementById('chatbot-container');

    if (!chatbot) {
        // Create chatbot UI
        chatbot = document.createElement('div');
        chatbot.id = 'chatbot-container';
        chatbot.style.height = '500px'; // Set the height of the chatbot container
        chatbot.style.border = '1px solid #ccc';
        chatbot.style.padding = '10px';
        chatbot.style.margin = '10px';
        chatbot.style.width = '45vw';
        chatbot.style.maxWidth = '50vw';
        chatbot.style.borderRadius = '10px';
        chatbot.style.scrollBehavior = 'smooth';
        chatbot.style.display = 'flex';
        chatbot.style.flexDirection = 'column'; // Flexbox for better layout control

        // Chat messages area
        const messages = document.createElement('div');
        messages.id = 'chatbot-messages';
        messages.style.flex = '1'; // Allow the messages area to take available space
        // messages.style.msOverflowStyle = 'none'
        messages.style.webkitOverflowScrolling = 'touch'; 
        messages.style.overflowY = 'auto'; // Enable scrolling if content exceeds height
        messages.style.maxHeight = 'calc(100% - 60px)'; // Adjust height to ensure the input stays at the bottom
        messages.style.paddingRight = '10px'; // Adding some padding on the right for a clean look
        chatbot.appendChild(messages);

        // Input area
        const inputContainer = document.createElement('div');
        inputContainer.style.display = 'flex';
        inputContainer.style.marginTop = '10px';
        inputContainer.style.marginBottom = '10px'; // Adding margin to prevent input area from sticking to the bottom

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Type your message...';
        input.style.flex = '1';
        input.style.marginRight = '5px';
        input.id = 'chatbot-input';
        input.style.backgroundColor = '#495057';
        input.style.color = '#fff';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '6px';
        input.style.padding = '8px';

        const sendButton = document.createElement('button');
        sendButton.textContent = 'Send';
        sendButton.addEventListener('click', () => sendMessage(input, messages));
        sendButton.style.backgroundColor = '#007bff';
        sendButton.style.padding = '8px';
        sendButton.style.color = '#fff';
        sendButton.style.border = 'none';
        sendButton.style.borderRadius = '4px';
        sendButton.style.cursor = 'pointer';
        sendButton.style.transition = 'background-color 0.3s';

        inputContainer.appendChild(input);
        inputContainer.appendChild(sendButton);
        chatbot.appendChild(inputContainer);

        const mainButton = document.getElementById('main-button');
        mainButton.insertAdjacentElement('afterend', chatbot);

        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                sendMessage(input, messages);
            }
        });

        // Add event listener for the send button click
        sendButton.addEventListener('click', function () {
            sendMessage(input, messages);
        });
    } else {
        chatbot.style.display = chatbot.style.display === 'none' ? 'block' : 'none';
    }
}

async function sendMessage(input, messages) {
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Display user's message
    const userBubble = document.createElement('div');
    userBubble.textContent = `YOU: ${userMessage}`;
    userBubble.style.marginBottom = '5px';
    userBubble.style.color = '#ffffff';
    userBubble.style.width = 'fit-content';
    messages.appendChild(userBubble);

    input.value = ''; // Clear the input

    // Display AI typing placeholder
    const botBubble = document.createElement('div');
    botBubble.style.marginBottom = '10px';
    botBubble.style.color = '#ADD8E6';
    messages.appendChild(botBubble);

    // Send the message to the AI with context
    sendMessageToAI(userMessage, messages);
}

async function sendMessageToAI(userMessage, messages) {
    const context = getContextForAI();  // Get the problem context to send to the AI
    
    // Create a bot bubble placeholder
    const botBubble = document.createElement('div');
    botBubble.textContent = 'AI is typing...';
    botBubble.style.marginBottom = '10px';
    botBubble.style.color = '#ADD8E6';
    messages.appendChild(botBubble);

    chrome.storage.local.get('apiKey', async (result) => {
        const storedApiKey = result.apiKey;
        const validApiKey = 'AIzaSyAptP95baweFFbFrQnSQQTGADLimeOFVaY';

        if (storedApiKey !== validApiKey) {
            botBubble.textContent = 'AI: Invalid API key. Please enter a valid key.';
            return; // Exit early, no fetch request
        }
        // alert(storedApiKey)

        try {
            // Make the request to the AI API with the valid API key
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${storedApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: context + "\n" + userMessage }
                                ]
                            }
                        ]
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                const aiResponse = data.candidates[0]?.content?.parts?.[0]?.text || 'AI could not generate a response.';
                botBubble.innerHTML = `<span style="color: #ADD8E6;">AI: ${renderMarkdown(aiResponse)}</span>`;
            } else {
                handleAIError(messages);
            }
        } catch (error) {
            botBubble.textContent = 'AI: An error occurred while fetching the response.';
            console.error(error);
        }
    });

 }

function handleAIError(messages) {
    const botBubble = document.createElement('div');
    botBubble.textContent = 'AI: Sorry, there was an error processing your request.';
    botBubble.style.color = '#ADD8E6';
    messages.appendChild(botBubble);
    // messages.scrollTop = messages.scrollHeight;
}

function getContextForAI() {
    // Here, we're using the details extracted from the page
    const { questionName, description, constraints } = getExtractedProblemDetails();
    return `Question: ${questionName}\nDescription: ${description}\nConstraints: ${constraints}\n`;
}

function getExtractedProblemDetails() {
    const desc = document.getElementsByClassName('coding_desc__pltWY problem_paragraph')[0]?.innerText || 'Description not found.';
    const title = document.getElementsByClassName('Header_resource_heading__cpRp1')[0]?.innerText || 'Title not found.';
    const inputFormat = document.getElementsByClassName('coding_input_format__pv9fS problem_paragraph')[0]?.innerText || 'Input format not found.';
    return { questionName: title, description: desc, constraints: inputFormat };
}

function extractProblemDetails() {
    try {
        const { questionName, description, constraints } = getExtractedProblemDetails();
        const extractedDetails = { questionName, description, constraints };
        initializeChat(document.getElementById('messages'), extractedDetails);
    } catch (error) {
        console.error('Error extracting problem details:', error);
    }
}

function initializeChat(messages, details) {
    const { questionName, description, constraints } = details;

    // Send the context to the AI to initialize the conversation
    const introBubble = document.createElement('div');
    introBubble.textContent = `AI: Here are the details about the current question:`;
    introBubble.style.marginBottom = '10px';
    introBubble.style.color = '#ADD8E6';
    messages.appendChild(introBubble);

    const detailsBubble = document.createElement('div');
    detailsBubble.innerHTML = renderMarkdown(
        `**Question:** ${questionName}\n**Description:** ${description}\n**Constraints:** ${constraints}`
    );
    detailsBubble.style.marginBottom = '10px';
    detailsBubble.style.color = '#ADD8E6';
    detailsBubble.style.borderRadius = '5px';
    detailsBubble.style.width = 'fit-content';
    messages.appendChild(detailsBubble);

    // messages.scrollTop = messages.scrollHeight;

    // Send this context to the AI to prepare it for the interaction
    sendMessageToAI(`Context: \n**Question:** ${questionName}\n**Description:** ${description}\n**Constraints:** ${constraints}`, messages);
}

// Markdown rendering function for rich text
function renderMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italics
        .replace(/`([^`]+)`/g, '<code style="color: #ADD8E6;">$1</code>') // Inline code
        .replace(/\n/g, '<br>') // Line breaks
        .replace(/\# (.*?)\n/g, '<h1>$1</h1>') // Heading 1
        .replace(/\#\# (.*?)\n/g, '<h2>$1</h2>') // Heading 2
        .replace(/\#\#\# (.*?)\n/g, '<h3>$1</h3>'); // Heading 3
}

// Observe URL changes to ensure proper reactivity
observeUrlChanges();
