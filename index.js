import { extension_settings, eventSource, event_types, saveSettingsDebounced } from "../../../script.js";
import { applyTextTransformations } from "./text-processor.js";

const DEFAULT_SETTINGS = {
    enabled: true
};

const extensionName = "wintryice0-asterisks";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || DEFAULT_SETTINGS;
}

function processMessage(element) {
    if (!extension_settings[extensionName].enabled) return;
    
    const contentBlocks = element.querySelectorAll(".mes_text, .mes__edit_content");
    contentBlocks.forEach(block => {
        block.innerHTML = applyTextTransformations(block.innerHTML);
    });
}

jQuery(async () => {
    loadSettings();
    
    const settingsHtml = await $.get(`${extensionFolderPath}/example.html`);
    $("#extensions_settings").append(settingsHtml);
    
    $("#asterisk-processor-enabled")
        .prop("checked", extension_settings[extensionName].enabled)
        .on("change", function() {
            extension_settings[extensionName].enabled = this.checked;
            saveSettingsDebounced();
            eventSource.emit(event_types.CHAT_CHANGED);
        });
    
    eventSource.on(event_types.MESSAGE_RECEIVED, processMessage);
    eventSource.on(event_types.MESSAGE_SWIPED, processMessage);
});
