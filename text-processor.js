// text-processor.js
export function applyTextTransformations(text, substituteBoundaries) {
    let inQuote = false;
    let inAsterisk = false;
    let asteriskBuffer = [];
    let result = [];
    
    // Main processing logic
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (char === '"') {
            if (inQuote) {
                if (inAsterisk) {
                    result.push(asteriskBuffer.join('').toUpperCase());
                    asteriskBuffer = [];
                    inAsterisk = false;
                }
                result.push(char);
                inQuote = false;
            } else {
                if (inAsterisk) {
                    result.push(`**${asteriskBuffer.join('')}**`);
                    asteriskBuffer = [];
                    inAsterisk = false;
                }
                result.push(char);
                inQuote = true;
            }
        } else if (char === '*') {
            if (inQuote) {
                if (inAsterisk) {
                    result.push(asteriskBuffer.join('').toUpperCase());
                    asteriskBuffer = [];
                    inAsterisk = false;
                } else {
                    inAsterisk = true;
                    asteriskBuffer = [];
                }
            } else {
                if (inAsterisk) {
                    result.push(`**${asteriskBuffer.join('')}**`);
                    asteriskBuffer = [];
                    inAsterisk = false;
                } else {
                    inAsterisk = true;
                    asteriskBuffer = [];
                }
            }
        } else {
            if (inAsterisk) {
                asteriskBuffer.push(char);
            } else {
                result.push(char);
            }
        }
    }
    
    // Handle remaining asterisk content
    if (inAsterisk) {
        const content = asteriskBuffer.join('');
        result.push(inQuote ? content.toUpperCase() : `**${content}**`);
    }
    
    let processedText = result.join('');
    
    // Additional boundary substitution if enabled
    if (substituteBoundaries) {
        processedText = processedText
            .replace(/\*\*"/g, '"')  // Replace **" with "
            .replace(/"\*\*/g, '"'); // Replace "** with "
    }
    
    return processedText;
}
