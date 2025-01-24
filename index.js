const extensionName = "code-transform-extension";
let changeHistory = new Map();

function initializeExtension() {
    addTransformButtons();
    setupEventListeners();
}

function addTransformButtons() {
    document.querySelectorAll('.mes').forEach(message => {
        const mesId = message.getAttribute('mesid');
        if (!mesId) return;  // Skip messages without ID
        
        if (!message.querySelector('.transform-button')) {
            const button = createTransformButton(message);
            if (!button) return;
            
            const buttonsContainer = message.querySelector('.mes_buttons') || createButtonsContainer(message);
            buttonsContainer.prepend(button);
        }
    });
}

function createTransformButton(message) {
    const mesId = message.getAttribute('mesid');
    if (!mesId) return null;

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

async function applyTextTransformation(content) {
    const modified = content.replace(/\bthe\b/gi, 'ITWORKS');
    return modified;
}

async function handleTransformClick(event) {
    const button = event.target;
    const mesId = button.dataset.mesId;
    const messageDiv = document.querySelector(`[mesid="${mesId}"]`);
    
    if (!messageDiv) {
        console.error('Message element not found');
        return;
    }

    const contentElement = messageDiv.querySelector('.mes_text');
    if (!contentElement) {
        console.error('Message content element not found');
        return;
    }

    if (!changeHistory.has(mesId)) {
        changeHistory.set(mesId, {
            original: contentElement.innerHTML,
            modified: null
        });
    }

    try {
        const currentContent = contentElement.textContent;
        const modifiedContent = await applyTextTransformation(currentContent);
        
        contentElement.textContent = modifiedContent;
        contentElement.classList.add('transformed');
        addRevertButton(messageDiv);
        
        changeHistory.get(mesId).modified = modifiedContent;
    } catch (error) {
        console.error('Transformation failed:', error);
    }
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
    
    if (!changeHistory.has(mesId)) {
        console.error('No history for message:', mesId);
        return;
    }

    const history = changeHistory.get(mesId);
    const messageDiv = document.querySelector(`[mesid="${mesId}"]`);
    
    if (!messageDiv) {
        console.error('Message element not found for revert');
        return;
    }

    const contentElement = messageDiv.querySelector('.mes_text');
    if (!contentElement) {
        console.error('Content element not found for revert');
        return;
    }

    contentElement.innerHTML = history.original;
    contentElement.classList.remove('transformed');
    button.remove();
    changeHistory.delete(mesId);
}

function setupEventListeners() {
    eventSource.on(event_types.MESSAGE_RECEIVED, addTransformButtons);
    eventSource.on(event_types.MESSAGE_EDITED, mesId => changeHistory.delete(mesId));
    eventSource.on(event_types.MESSAGE_DELETED_ALL, () => {
        changeHistory.clear();
        console.debug('Chat changed - cleared transformation history');
    });
}

jQuery(() => {
    initializeExtension();
    const debouncedButtons = debounce(addTransformButtons, 300);
    setInterval(debouncedButtons, 1000);
});

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}
