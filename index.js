// index.js
import { extension_settings, eventSource, event_types } from "../../../../script.js";
import { applyTextTransformations } from "./text-processor.js";

const DEFAULT_SETTINGS = {
    enabled: true
};

function loadSettings() {
    if (!extension_settings.asteriskProcessor) {
        extension_settings.asteriskProcessor = DEFAULT_SETTINGS;
    }
}

function processMessage(element) {
    if (!extension_settings.asteriskProcessor.enabled) return;
    
    const contentBlocks = element.querySelectorAll(".mes_text, .mes__edit_content");
    contentBlocks.forEach(block => {
        block.innerHTML = applyTextTransformations(block.innerHTML);
    });
}

function addSettings() {
    const settingsHtml = `
    <div class="asterisk-processor-settings">
        <h4>Asterisk Processor</h4>
        <label>
            <input type="checkbox" id="asterisk-processor-enabled">
            Enable Asterisk Processing
        </label>
    </div>`;
    
    $("#extensions_settings2").append(settingsHtml);
    
    $("#asterisk-processor-enabled").change(function() {
        extension_settings.asteriskProcessor.enabled = this.checked;
        eventSource.emit(event_types.CHAT_CHANGED);
    });
}

jQuery(async () => {
    loadSettings();
    addSettings();
    $("#asterisk-processor-enabled").prop("checked", extension_settings.asteriskProcessor.enabled);
    
    eventSource.on(event_types.MESSAGE_RECEIVED, processMessage);
    eventSource.on(event_types.MESSAGE_SWIPED, processMessage);
});
