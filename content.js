// content.js
// Author: Swapnaneel Ray

const mainbtnImg = chrome.runtime.getURL("assets/save.png");

let lastVis = "";
let chatCleared = false;

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

    observer.observe(document.body, { childList: true, subtree: true });

    checkPageChange(true);
}
function clearChatMessages() {
    const chatMessagesElement = document.getElementById('chatbot-messages');  
    if (chatMessagesElement) {
        chatMessagesElement.innerHTML = ''; 
    }
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
    mainButton.style.border = '0.5px solid white';
    mainButton.style.borderRadius = '5px';
    mainButton.style.backgroundColor = '#2B384E';
    mainButton.style.color = '#f8f9fa';
    mainButton.style.fontSize = '14px';
    mainButton.style.cursor = 'pointer';
    mainButton.style.transition = 'background-color 0.3s, transform 0.3s';
    mainButton.style.margin = '17px';
    mainButton.style.height = '50px';
    mainButton.style.width = '150px';


    const img = document.createElement('img');
    img.src = mainbtnImg;
    img.style.height = '20px';
    img.style.width = '20px';
    img.style.marginRight = '8px';
    mainButton.appendChild(img);

    const txt = document.createElement('span');
    txt.innerHTML = ' AI Help ! ';
    mainButton.appendChild(txt);
    txt.style.fontSize = '18px';
    mainButton.onmouseover = () => {
        mainButton.style.backgroundColor = '#0088ff';
        mainButton.style.border = 'none';
        mainButton.style.transform = 'scale(1.05)';
    };
    mainButton.onmouseout = () => {
        mainButton.style.backgroundColor = '#2B384E';
         mainButton.style.border = '0.5px solid white';
         mainButton.style.transform = 'scale(1)';
    };

    const askDoubtButton = document.getElementsByClassName('py-4 px-3 coding_desc_container__gdB9M')[0];
    if (!askDoubtButton) {
        console.error("Ask Doubt button not found. Main button will not be added.");
        return;
    }
    askDoubtButton.insertAdjacentElement('beforeend', mainButton);

    mainButton.addEventListener('click', toggleChatbot);
    mainButton.addEventListener('click', () => {
    const chatBox = document.getElementById('chatbot-container');
    window.scrollTo({
        top: chatBox.scrollHeight,  
        behavior: 'smooth',  
    });
});
}

function toggleChatbot() {
    let chatbot = document.getElementById('chatbot-container');
    const parentElement = document.getElementById('main-button').parentElement;
    if (!parentElement) {
        console.error("Parent element for chatbot container not found.");
        return;
    }

    if (!chatbot) {
        // Create chatbot UI
        chatbot = document.createElement('div');
        chatbot.id = 'chatbot-container';
        chatbot.style.height = '500px'; // Set the height of the chatbot container
        chatbot.style.border = '1px solid #ccc';
        chatbot.style.padding = '10px';
        chatbot.style.margin = '10px';
        chatbot.style.width = '42vw';
        chatbot.style.maxWidth = '50vw';
        chatbot.style.borderRadius = '10px';
        chatbot.style.scrollBehavior = 'smooth';
        chatbot.style.display = 'flex';
        chatbot.style.flexDirection = 'column';  
        chatbot.style.overflowY = 'auto'; 


        // Chat messages area
        const messages = document.createElement('div');
        messages.id = 'chatbot-messages';
        messages.style.flex = '1';  
        messages.style.overflowY = 'auto';
        messages.style.scrollbarWidth = 'none';
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
        chatbot.style.display = chatbot.style.display === 'none' ? 'flex' : 'none';
    }
}

async function sendMessage(input, messages) {
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Display user's message
    const userBubble = document.createElement('div');
    userBubble.textContent = `YOU : ${userMessage}`;
    userBubble.style.marginBottom = '5px';
    userBubble.style.color = '#ffff';
    userBubble.style.width = 'fit-content';
    userBubble.style.fontSize = '16px';
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
        
        const manifest = chrome.runtime.getManifest();
        const validApiKey = manifest.env.API_KEY;



        if (storedApiKey !== validApiKey) {
            botBubble.textContent = 'AI : Invalid API key. Please enter a valid key.';
            return;
        }

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
                botBubble.innerHTML = `<span style="color: #ADD8E6;">AI : ${renderMarkdown(aiResponse)}</span>`;
            } else {
                handleAIError(messages);
            }
        } catch (error) {
            botBubble.textContent = 'AI : An error occurred while fetching the response.';
            console.error(error);
        }
    });

 }

function handleAIError(messages) {
    const botBubble = document.createElement('div');
    botBubble.textContent = 'AI : Sorry, there was an error processing your request.';
    botBubble.style.color = '#ADD8E6';
    botBubble.style.fontSize = '18px';
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
        const details = getExtractedProblemDetails();
        const messages = document.getElementById('messages');
        if (!messages) {
            console.log("Chatbot messages container not found.");
            return;
        }
        initializeChat(messages, details);
    } catch (error) {
        console.error('Error extracting problem details:', error);
    }
}


function initializeChat(messages, details) {
    const { questionName, description, constraints } = details;

    // Send the context to the AI to initialize the conversation
    const introBubble = document.createElement('div');
    introBubble.textContent = `AI : Here are the details about the current question:`;
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
function renderMarkdown(text) {
    return text
        // Handle fenced code blocks (e.g., ```cpp ... ```), preserving the language
        .replace(/```([a-z]*)\n([\s\S]*?)```/g, function(_, lang, code) {
            const highlightedCode = code
                .replace(/</g, "&lt;") // Escape HTML to prevent issues
                .replace(/>/g, "&gt;"); // Escape HTML to prevent issues
            return `<pre><code class="${lang}" style="color: #ADD8E6; font-size: 16px;">${highlightedCode}</code></pre>`;
        })
        // Inline code (e.g., `inline code`)
        .replace(/`([^`]+)`/g, '<code style="color: #ADD8E6; font-size: 16px;">$1</code>') 
        // Bold text (**bold**)
        .replace(/\*\*(.*?)\*\*/g, '<strong style="font-size: 16px;">$1</strong>') 
        // Italics text (*italic*)
        .replace(/\*(.*?)\*/g, '<em style="font-size: 16px;">$1</em>') 
        // Line breaks
        .replace(/\n/g, '<br>') 
        // Heading 1 (# heading 1)
        .replace(/^\# (.*?)$/gm, '<h1 style="font-size: 16px;">$1</h1>') 
        // Heading 2 (## heading 2)
        .replace(/^\#\# (.*?)$/gm, '<h2 style="font-size: 16px;">$1</h2>') 
        // Heading 3 (### heading 3)
        .replace(/^\#\#\# (.*?)$/gm, '<h3 style="font-size: 16px;">$1</h3>') 
        // Blockquotes (e.g., > blockquote)
        .replace(/^\> (.*?)$/gm, '<blockquote style="font-size: 16px;">$1</blockquote>') 
        // Links [text](URL)
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g, '<a href="$2" style="font-size: 16px;">$1</a>') 
        // Unordered list items (- list item)
        .replace(/^\- (.*?)$/gm, '<li style="font-size: 16px;">$1</li>') 
        // Ordered list items (1. list item)
        .replace(/^\d+\. (.*?)$/gm, '<li style="font-size: 16px;">$1</li>') 
        // Wrap list items in <ul>
        .replace(/(<li>.*?<\/li>)(<br>)+/g, '<ul style="font-size: 16px;">$1</ul>') 
        // Images ![alt text](image URL)
        .replace(/^\!\[([^\]]*)\]\((https?:\/\/[^\s]+)\)/g, '<img alt="$1" src="$2" />') 
        // Horizontal rules (---)
        .replace(/^\-{3,}$/gm, '<hr style="font-size: 16px;">');
}



// Observe URL changes to ensure proper reactivity.
observeUrlChanges();

 
function trackUrlAndManageChat() {
    let lastUrl = window.location.href;

    function clearChatMessages() {
        const chatMessagesElement = document.querySelector('#chatbot-messages'); // Adjust the selector if needed
        if (chatMessagesElement) {
            chatMessagesElement.innerHTML = ''; // Clear the chat container
        }
    }

    function saveChatMessages() {
        const chatMessagesElement = document.querySelector('#chatbot-messages'); // Adjust the selector if needed
        if (chatMessagesElement) {
            const messages = chatMessagesElement.innerHTML; // Save the current chat messages
            localStorage.setItem(lastUrl, messages); // Use the URL as the key
        }
    }

    function loadChatMessages() {
        const chatMessagesElement = document.querySelector('#chatbot-messages'); // Adjust the selector if needed
        if (chatMessagesElement) {
            const savedMessages = localStorage.getItem(lastUrl); // Retrieve chat data for the current URL
            chatMessagesElement.innerHTML = savedMessages || ''; // Load saved messages or clear if none
        }
    }

    function isOnProblemsPath() {
        const pathname = window.location.pathname;
        return pathname.includes('/problems/');
    }

    function handleUrlChange() {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            saveChatMessages(); // Save current chat history for the last URL
            lastUrl = currentUrl;
            if (isOnProblemsPath()) {
                loadChatMessages(); // Load chat history for the new URL or clear if none exists
            } else {
                clearChatMessages(); // Clear chat if not on the problems path
            }
        }
    }

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    setInterval(handleUrlChange, 500); // Periodic check for URL changes

    // Load initial chat messages
    loadChatMessages();
}

trackUrlAndManageChat();
