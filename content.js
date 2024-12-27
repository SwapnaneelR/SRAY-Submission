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

    const askDoubtButton = document.querySelector('.py-4.px-3.coding_desc_container__gdB9M');
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
        chatbot.style.border = '1px solid #ccc';
        chatbot.style.padding = '10px';
        chatbot.style.margin = '10px';
        chatbot.style.width = '45vw';
        chatbot.style.maxWidth = '50vw';
        chatbot.style.borderRadius = '10px';
        chatbot.style.scrollBehavior = 'smooth';

        // chatbot.style.backgroundColor = '#';

        // Chat messages area
        const messages = document.createElement('div');
        messages.id = 'chatbot-messages';
        messages.style.height = '200px';
        messages.style.overflowY = 'auto';
        messages.style.borderBottom = '1px solid #ddd';
        chatbot.appendChild(messages);

        // Input area
        const inputContainer = document.createElement('div');
        inputContainer.style.display = 'flex';
        inputContainer.style.marginTop = '10px';

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
    userBubble.textContent = `YOU :  ${userMessage}`;
    userBubble.style.marginBottom = '5px';
    userBubble.style.color = '#ffffff';
    userBubble.style.width = 'fit-content';
    messages.appendChild(userBubble);

    input.value = ''; 

    // Display AI typing placeholder
    const botBubble = document.createElement('div');
    botBubble.textContent = 'AI is typing...';
    botBubble.style.marginBottom = '10px';
    botBubble.style.color = '#ADD8E6';
    messages.appendChild(botBubble);
    // initializeChat(messages, extractedDetails);
    const API_KEY = 'AIzaSyAptP95baweFFbFrQnSQQTGADLimeOFVaY';
    // Call AI API
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: userMessage }]
                        }
                    ]
                })
            }
        );

        if (response.ok) {
            const data = await response.json();
            const aiResponse = data.candidates[0]?.content?.parts?.[0]?.text || 'AI could not generate a response.';
              if (aiResponse.includes('function')) {
                const codeSnippet = document.createElement('pre');
                codeSnippet.style.backgroundColor = '#f0f0f0';
                codeSnippet.style.border = '1px solid #ccc';
                codeSnippet.style.padding = '10px';
                codeSnippet.style.borderRadius = '5px';
                codeSnippet.textContent = aiResponse;
                botBubble.textContent = 'AI: Here\'s the code snippet:';
                messages.appendChild(codeSnippet);
            } else {
                botBubble.textContent = `AI: ${aiResponse}`;
            }
            botBubble.textContent = `AI :  ${aiResponse}`;
        } else {
            botBubble.textContent = 'AI :  Sorry, there was an error processing your request.';
        }
    } catch (error) {
        botBubble.textContent = 'AI :  An error occurred while connecting to the AI API.';
        console.error(error);
    }

    // Scroll to the bottom of the messages
    messages.scrollTop = messages.scrollHeight;
}


// adding the details on the screen as prior knowledge : 


function initializeChat(messages, details) {
    const { questionName, description, constraints } = details;

    // Add preloaded information to the chatbox
    const introBubble = document.createElement('div');
    introBubble.textContent = `AI :  Hi! I already know about the question. Here are the details:`;
    introBubble.style.marginBottom = '10px';
    introBubble.style.color = '#ADD8E6';
    messages.appendChild(introBubble);

    const detailsBubble = document.createElement('div');
    detailsBubble.innerHTML = `<strong>Question:</strong> ${questionName}<br><strong>Description:</strong> ${description}<br><strong>Constraints:</strong> ${constraints}`;
    detailsBubble.style.marginBottom = '10px';
    detailsBubble.style.color = '#ADD8E6';
    // detailsBubble.style.backgroundColor = '#f0f0f0';
    // detailsBubble.style.padding = '10px';
    detailsBubble.style.borderRadius = '5px';
    detailsBubble.style.width = 'fit-content';
    messages.appendChild(detailsBubble);

    messages.scrollTop = messages.scrollHeight;
}
// Example details extracted from the current window
// const extractedDetails = {
//     questionName: 'How AI Works',
//     description: 'Explain how artificial intelligence functions, including its core components and processes.',
//     constraints: 'Keep the explanation under 50 words and use simple language.'
// };




observeUrlChanges();
