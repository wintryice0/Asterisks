const extensionName = "code-transform-extension";

function initializeExtension() {
    addTransformButtons();
    setupEventListeners();
    setupMutationObserver();
}

function addTransformButtons() {
    document.querySelectorAll('.mes:not(.transform-processed)').forEach(message => {
        if (!message.querySelector('.mes_text')) return;
        
        message.classList.add('transform-processed');
        const buttonsContainer = message.querySelector('.mes_buttons') || createButtonsContainer(message);
        
        if (!buttonsContainer.querySelector('.transform-button')) {
            const button = createTransformButton(message);
            buttonsContainer.prepend(button);
        }
    });
}

function createTransformButton(message) {
    const button = document.createElement('div');
    button.className = 'mes_button transform-button fa-solid fa-wand-magic-sparkles';
    button.title = 'Apply Code Transformation';
    button.dataset.mesId = message.dataset.mesId;
    return button;
}

function createButtonsContainer(message) {
    const container = document.createElement('div');
    container.className = 'mes_buttons';
    message.append(container);
    return container;
}

async function applyTextTransformation(content) {
    const modified = content.replace(/\bthe\b/gi, 'ITWORKS');
    return modified;
}

async function handleTransformClick(event) {
    const button = event.target.closest('.transform-button');
    if (!button) return;

    const mesId = button.dataset.mesId;
    const messageDiv = document.querySelector(`[data-mesid="${mesId}"]`);
    const contentElement = messageDiv.querySelector('.mes_text');

    if (!contentElement.dataset.original) {
        contentElement.dataset.original = contentElement.innerHTML;
    }

    const modifiedContent = await applyTextTransformation(contentElement.textContent);
    contentElement.textContent = modifiedContent;
    contentElement.classList.add('transformed');
    addRevertButton(messageDiv);
}

function addRevertButton(messageDiv) {
    if (!messageDiv.querySelector('.revert-button')) {
        const button = document.createElement('div');
        button.className = 'mes_button revert-button fa-solid fa-rotate-left';
        button.title = 'Revert to Original';
        button.dataset.mesId = messageDiv.dataset.mesId;
        messageDiv.querySelector('.mes_buttons').prepend(button);
    }
}

async function handleRevertClick(event) {
    const button = event.target.closest('.revert-button');
    if (!button) return;

    const mesId = button.dataset.mesId;
    const messageDiv = document.querySelector(`[data-mesid="${mesId}"]`);
    const contentElement = messageDiv.querySelector('.mes_text');

    if (contentElement.dataset.original) {
        contentElement.innerHTML = contentElement.dataset.original;
        contentElement.classList.remove('transformed');
        contentElement.removeAttribute('data-original');
        button.remove();
    }
}

function setupEventListeners() {
    document.body.addEventListener('click', (event) => {
        if (event.target.closest('.transform-button')) handleTransformClick(event);
        if (event.target.closest('.revert-button')) handleRevertClick(event);
    });

    eventSource.on(event_types.MESSAGE_RECEIVED, addTransformButtons);
    eventSource.on(event_types.MESSAGE_EDITED, addTransformButtons);
    eventSource.on(event_types.MESSAGE_DELETED, (mesId) => {
        document.querySelectorAll(`[data-mesid="${mesId}"]`).forEach(el => el.remove());
    });
    eventSource.on(event_types.CHAT_CHANGED, () => {
        document.querySelectorAll('.transform-processed').forEach(msg => {
            msg.classList.remove('transform-processed');
        });
        addTransformButtons();
    });
}

function setupMutationObserver() {
    const findChatContainer = () => {
        const container = document.querySelector('#chatList, .chat-container');
        if (container) return container;
        
        console.warn('Chat container not found, retrying...');
        setTimeout(findChatContainer, 1000);
        return null;
    };

    const chatContainer = findChatContainer();
    if (!chatContainer) return;

    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                addTransformButtons();
            }
        });
    });

    observer.observe(chatContainer, {
        childList: true,
        subtree: true
    });
}

jQuery(() => initializeExtension());
