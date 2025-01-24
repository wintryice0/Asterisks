// Import necessary functions from SillyTavern
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

// Define extension name and folder path
const extensionName = "quickactions";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

// Initialize extension settings
const extensionSettings = extension_settings[extensionName];
const defaultSettings = {};

// Function to create the Quick Actions Bar
function createQuickActionsBar() {
    const container = document.createElement('div');
    container.id = 'quickActionsBar';
    container.className = 'flex-container flexGap5';

    const commands = [
        { 
            name: 'Retry', 
            command: '/retry', 
            executeDirectly: true,
            icon: 'fa-solid fa-arrow-rotate-left'
        },
        { 
            name: 'Continue', 
            command: '/continue', 
            executeDirectly: true,
            icon: 'fa-solid fa-forward'
        },
        { 
            name: 'Summary', 
            command: '/summary', 
            executeDirectly: true,
            icon: 'fa-solid fa-file-lines'
        },
        { 
            name: 'Send As', 
            command: '/sendas name="Character"', 
            executeDirectly: false,
            icon: 'fa-solid fa-quote-right'
        },
    ];

    commands.forEach(({ name, command, executeDirectly, icon }) => {
        const button = document.createElement('div');
        button.className = 'quick-action-button';
        button.title = name;
        button.innerHTML = `<i class="${icon}"></i>`;
        
        button.addEventListener('click', () => {
            if (executeDirectly) {
                executeSlashCommandsWithOptions(command);
            } else {
                const textarea = document.getElementById('send_textarea');
                if (textarea) {
                    textarea.value = `${command} ${textarea.value}`;
                    textarea.focus();
                }
            }
        });
        
        container.appendChild(button);
    });

    const sendForm = document.getElementById('form_send');
    if (sendForm) {
        sendForm.insertBefore(container, sendForm.querySelector('.spinBtn'));
    }
}

// Main initialization function
jQuery(async () => {
    // Ensure the DOM is fully loaded before creating the Quick Actions Bar
    await loadExtensionSettings(extensionName);
    createQuickActionsBar();
});
