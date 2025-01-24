
// In index.js
const extensionName = "code-transform-extension";
let changeHistory = new Map();

function initializeExtension() {
    addTransformButtons();
    setupEventListeners();
}

function addTransformButtons() {
    document.querySelectorAll('.mes').forEach(message => {
        const mesId = message.getAttribute('mesid');
        if (!mesId) return; // Skip messages without mesid
        
        if (!message.querySelector('.transform-button')) {
            const button = createTransformButton(message);
            const buttonsContainer = message.querySelector('.mes_buttons') || createButtonsContainer(message);
            buttonsContainer.prepend(button);
        }
    });
}

function createTransformButton(message) {
    const mesId = message.getAttribute('mesid');
    if (!mesId) return null; // Ensure mesid exists
    
    const button = document.createElement('div');
    button.className = 'mes_button transform-button fa-solid fa-wand-magic-sparkles';
    button.title = 'Apply Code Transformation';
    button.dataset.mesId = mesId;
    button.addEventListener('click', handleTransformClick);
    return button;
}

// Update setupEventListeners to clear history on chat switch


// Remainder of the code remains the same



function createButtonsContainer(message) {
    const container = document.createElement('div');
    container.className = 'mes_buttons';
    message.prepend(container); // Prepend to place buttons before content
    return container;
}


async function applyTextTransformation(content) {
    // Case-insensitive replacement of 'the' with 'ITWORKS'
    const modified = content.replace(/\bthe\b/gi, 'ITWORKS');
    return modified;
}

async function handleTransformClick(event) {
    const button = event.target;
    const mesId = button.dataset.mesId;
    const messageDiv = document.querySelector(`[mesid="${mesId}"]`);
    const contentElement = messageDiv.querySelector('.mes_text');
    
    // Store original content
    if (!changeHistory.has(mesId)) {
        changeHistory.set(mesId, {
            original: contentElement.innerHTML,
            modified: null
        });
    }

    // Apply transformation
    const currentContent = contentElement.textContent;
    const modifiedContent = await applyTextTransformation(currentContent);
    
    // Update UI
    contentElement.textContent = modifiedContent; // Use textContent to avoid re-rendering HTML
    contentElement.classList.add('transformed');
    addRevertButton(messageDiv);
    
    // Update history
    changeHistory.get(mesId).modified = modifiedContent;
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
    
    if (history && history.original) {
        const messageDiv = document.querySelector(`[mesid="${mesId}"]`);
        const contentElement = messageDiv.querySelector('.mes_text');
        contentElement.innerHTML = history.original;
        contentElement.classList.remove('transformed');
        button.remove();
    }
}


function setupEventListeners() {
    eventSource.on(event_types.MESSAGE_RECEIVED, addTransformButtons);
    eventSource.on(event_types.MESSAGE_EDITED, mesId => changeHistory.delete(mesId));
    eventSource.on(event_types.MESSAGE_DELETED_ALL, () => changeHistory.clear());
}


// Initialize when ready
jQuery(() => {
    initializeExtension();
    setInterval(addTransformButtons, 1000);  // Ensure buttons on new messages
});


