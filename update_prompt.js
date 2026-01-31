const fs = require('fs');
const path = require('path');

// File paths
const NEW_PROMPT_FILE = path.join(__dirname, 'new_backfill_prompt.txt');
const PROMPT_MANAGER_FILE = path.join(__dirname, 'prompt_manager.js');

console.log('Starting prompt replacement...\n');

// Read the new prompt content
console.log('Reading new prompt from:', NEW_PROMPT_FILE);
const newPromptContent = fs.readFileSync(NEW_PROMPT_FILE, 'utf8');
console.log(`New prompt length: ${newPromptContent.length} characters\n`);

// Read the prompt_manager.js file
console.log('Reading prompt_manager.js from:', PROMPT_MANAGER_FILE);
let pmContent = fs.readFileSync(PROMPT_MANAGER_FILE, 'utf8');
console.log(`Original file length: ${pmContent.length} characters\n`);

// Function to escape content for JavaScript string literal
function escapeForJsString(content) {
    return content
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$');
}

// Escape the new prompt content
const escapedNewPrompt = escapeForJsString(newPromptContent);

// Replace DEFAULT_BACKFILL_PROMPT
console.log('Replacing DEFAULT_BACKFILL_PROMPT...');
const promptStartPattern = /const DEFAULT_BACKFILL_PROMPT = `[\s\S]*?`;/;
const newPromptDef = `const DEFAULT_BACKFILL_PROMPT = \`${escapedNewPrompt}\`;`;

if (promptStartPattern.test(pmContent)) {
    pmContent = pmContent.replace(promptStartPattern, newPromptDef);
    console.log('✓ DEFAULT_BACKFILL_PROMPT replaced successfully\n');
} else {
    console.error('✗ Could not find DEFAULT_BACKFILL_PROMPT pattern\n');
    process.exit(1);
}

// Replace DEFAULT_BACKFILL_PROMPT_NO_TABLE8
// For the NO_TABLE8 version, we need to create a version without table 8 references
console.log('Creating NO_TABLE8 version of the prompt...');
const noTable8Prompt = newPromptContent.replace(/表8[^\n]*/g, '').replace(/物品追踪[^\n]*/g, '');
const escapedNoTable8Prompt = escapeForJsString(noTable8Prompt);

const noTable8Pattern = /const DEFAULT_BACKFILL_PROMPT_NO_TABLE8 = `[\s\S]*?`;/;
const newNoTable8Def = `const DEFAULT_BACKFILL_PROMPT_NO_TABLE8 = \`${escapedNoTable8Prompt}\`;`;

if (noTable8Pattern.test(pmContent)) {
    pmContent = pmContent.replace(noTable8Pattern, newNoTable8Def);
    console.log('✓ DEFAULT_BACKFILL_PROMPT_NO_TABLE8 replaced successfully\n');
} else {
    console.error('✗ Could not find DEFAULT_BACKFILL_PROMPT_NO_TABLE8 pattern\n');
    process.exit(1);
}

// Write the updated content back to prompt_manager.js
console.log('Writing updated content back to prompt_manager.js...');
fs.writeFileSync(PROMPT_MANAGER_FILE, pmContent, 'utf8');
console.log(`✓ File updated successfully\n`);
console.log(`New file length: ${pmContent.length} characters\n`);

console.log('Prompt replacement completed successfully!');
