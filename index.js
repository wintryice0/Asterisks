const { executeSlashCommandsWithOptions } = SillyTavern.getContext();

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

// Initialize extension
(function() {
    createQuickActionsBar();
})();
