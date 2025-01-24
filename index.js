const extensionName = "code-transform-extension";

function initializeExtension() {
    addTransformButtons();
    setupEventListeners();
    setupMutationObserver();
}

function addTransformButtons() {
    document.querySelectorAll('.mes:not(.processed)').forEach(message => {
        message.classList.add('processed'); // Mark as processed
        const button = createTransformButton(message);
        const buttonsContainer = message.querySelector('.mes_buttons') || createButtonsContainer(message);
        buttonsContainer.prepend(button);
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
    message.append(container); // Append to work with ST's layout
    return container;
}

async function applyTextTransformation(content) {
    // Your transformation logic here
    const modified = content.replace(/\bthe\b/gi, 'ITWORKS');
    return modified;
}

async function handleTransformClick(event) {
    const button = event.target.closest('.transform-button');
    const mesId = button.dataset.mesId;
    const messageDiv = document.querySelector(`[data-mesid="${mesId}"]`);
    const contentElement = messageDiv.querySelector('.mes_text');

    if (!contentElement.dataset.original) {
        contentElement.dataset.original = contentElement.innerHTML;
    }

    const currentContent = contentElement.textContent;
    const modifiedContent = await applyTextTransformation(currentContent);

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
        if (event.target.closest('.transform-button')) {
            handleTransformClick(event);
        }
        if (event.target.closest('.revert-button')) {
            handleRevertClick(event);
        }
    });

    eventSource.on(event_types.MESSAGE_RECEIVED, addTransformButtons);
    eventSource.on(event_types.MESSAGE_EDITED, addTransformButtons);
    eventSource.on(event_types.MESSAGE_DELETED, (mesId) => {
        document.querySelectorAll(`[data-mesid="${mesId}"]`).forEach(el => el.remove());
    });

}



function setupMutationObserver() {
    const chatContainer = document.querySelector('#chatList, .chat-container') || document.body;

    const observer = new MutationObserver(() => {
        addTransformButtons();
    });

    observer.observe(chatContainer, {
        childList: true,
        subtree: true
    });
}

jQuery(() => initializeExtension());
