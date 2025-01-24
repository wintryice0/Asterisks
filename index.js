const extensionName = "code-transform-extension";
let changeHistory = new Map();
let observer;

function initializeExtension() {
    addTransformButtons();
    setupEventListeners();
    setupMutationObserver();

    // Re-check for messages after short delay (ST async rendering)
    setTimeout(addTransformButtons, 500);
}

function setupMutationObserver() {
    const chatContainer = document.getElementById('chat');
    if (!chatContainer) {
        console.error("Chat container not found!");
        return;
    }

    // Disconnect existing observer before reinitializing
    if (observer) {
        observer.disconnect();
    }

    observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    // Handle both new messages and re-rendered messages
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const message = node.classList.contains('mes') ? node : node.querySelector('.mes');
                        if (message) {
                            addButtonToMessage(message);
                        }
                    }
                });
            }
        });
    });

    // Observe the ENTIRE chat container (including subtree)
    observer.observe(chatContainer, { 
        childList: true, 
        subtree: true // 🔑 Critical for nested messages
    });
}

function addTransformButtons() {
    document.querySelectorAll('.mes:not(.xdc-processed)').forEach(message => {
        addButtonToMessage(message);
        message.classList.add('xdc-processed');
    });
}

function addButtonToMessage(message) {
    const mesId = message.getAttribute('mesid');
    if (!mesId || message.querySelector('.transform-button')) return;

    // 🔍 More robust container check
    let buttonsContainer = message.querySelector('.mes_buttons');
    if (!buttonsContainer) {
        buttonsContainer = createButtonsContainer(message);
    }

    const button = createTransformButton(mesId);
    buttonsContainer.prepend(button);
}

function createTransformButton(mesId) {
    const button = document.createElement('div');
    button.className = 'mes_button transform-button fa-solid fa-wand-magic-sparkles';
    button.title = 'Apply Code Transformation';
    button.dataset.mesId = mesId;
    button.addEventListener('click', handleTransformClick);
    return button;
}

function createButtonsContainer(message) {
    const container = document.createElement('div');
    container.className = 'mes_buttons';
    message.prepend(container);
    return container;
}

function setupEventListeners() {
    eventSource.on(event_types.CHAT_CHANGED, () => {
        changeHistory.clear();
        // Reinitialize observer for new chat container
        setupMutationObserver();
        addTransformButtons();
    });
    eventSource.on(event_types.MESSAGE_RECEIVED, addTransformButtons);
    eventSource.on(event_types.MESSAGE_EDITED, mesId => changeHistory.delete(mesId));
    eventSource.on(event_types.MESSAGE_DELETED_ALL, () => changeHistory.clear());
}

async function handleTransformClick(event) {
    const button = event.target;
    const mesId = button.dataset.mesId;
    const messageDiv = document.querySelector(`[mesid="${mesId}"]`);
    const contentElement = messageDiv.querySelector('.mes_text');
    
    if (!changeHistory.has(mesId)) {
        changeHistory.set(mesId, {
            original: contentElement.innerHTML,
            modified: null
        });
    }

    const currentContent = contentElement.textContent;
    const modifiedContent = await applyTextTransformation(currentContent);
    
    contentElement.textContent = modifiedContent;
    contentElement.classList.add('transformed');
    addRevertButton(messageDiv);
    
    changeHistory.get(mesId).modified = modifiedContent;
}

async function applyTextTransformation(content) {
    return applyTextTransformations(content);
}

function addRevertButton(messageDiv) {
    if (!messageDiv.querySelector('.revert-button')) {
        const button = document.createElement('div');
        button.className = 'mes_button revert-button fa-solid fa-rotate-left';
        button.title = 'Revert to Original';
        button.dataset.mesId = messageDiv.getAttribute('mesid');
        button.addEventListener('click', handleRevertClick);
        messageDiv.querySelector('.mes_buttons').prepend(button);
    }
}

async function handleRevertClick(event) {
    const button = event.target;
    const mesId = button.dataset.mesId;
    const history = changeHistory.get(mesId);
    
    if (history?.original) {
        const messageDiv = document.querySelector(`[mesid="${mesId}"]`);
        const contentElement = messageDiv.querySelector('.mes_text');
        contentElement.innerHTML = history.original;
        contentElement.classList.remove('transformed');
        button.remove();
    }
}

jQuery(() => initializeExtension());
