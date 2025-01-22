// text-processor.js
export function applyTextTransformations(text) {
    let inQuote = false;
    let inAsterisk = false;
    let asteriskBuffer = [];
    let result = [];
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (char === '"') {
            if (inQuote) {
                // Closing quote
                if (inAsterisk) {
                    result.push(asteriskBuffer.join('').toUpperCase());
                    asteriskBuffer = [];
                    inAsterisk = false;
                }
                result.push(char);
                inQuote = false;
            } else {
                // Opening quote
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
    
    return result.join('');
}
