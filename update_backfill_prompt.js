const fs = require('fs');
const path = require('path');

// File paths
const NEW_PROMPT_FILE = path.join(__dirname, 'new_backfill_prompt.txt');
const PROMPT_MANAGER_FILE = path.join(__dirname, 'prompt_manager.js');

console.log('开始更新批量填表（含表8）提示词...\n');

// Read the new prompt content
console.log('读取新提示词:', NEW_PROMPT_FILE);
const newPromptContent = fs.readFileSync(NEW_PROMPT_FILE, 'utf8');
console.log(`新提示词长度: ${newPromptContent.length} 字符\n`);

// Read the prompt_manager.js file
console.log('读取 prompt_manager.js:', PROMPT_MANAGER_FILE);
let pmContent = fs.readFileSync(PROMPT_MANAGER_FILE, 'utf8');
console.log(`原文件长度: ${pmContent.length} 字符\n`);

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
console.log('替换 DEFAULT_BACKFILL_PROMPT...');
const promptStartPattern = /const DEFAULT_BACKFILL_PROMPT = `[\s\S]*?`;(?=\s*\/\/)/;
const newPromptDef = `const DEFAULT_BACKFILL_PROMPT = \`${escapedNewPrompt}\`;`;

if (promptStartPattern.test(pmContent)) {
    pmContent = pmContent.replace(promptStartPattern, newPromptDef);
    console.log('✓ DEFAULT_BACKFILL_PROMPT 替换成功\n');
} else {
    console.error('✗ 找不到 DEFAULT_BACKFILL_PROMPT 模式\n');
    process.exit(1);
}

// Replace DEFAULT_BACKFILL_PROMPT_NO_TABLE8
// For the NO_TABLE8 version, we need to create a version without table 8 references
console.log('创建 NO_TABLE8 版本...');
const noTable8Prompt = newPromptContent.replace(/表8[^\n]*/g, '').replace(/物品追踪[^\n]*/g, '');
const escapedNoTable8Prompt = escapeForJsString(noTable8Prompt);

const noTable8Pattern = /const DEFAULT_BACKFILL_PROMPT_NO_TABLE8 = `[\s\S]*?`;(?=\s*\/\/)/;
const newNoTable8Def = `const DEFAULT_BACKFILL_PROMPT_NO_TABLE8 = \`${escapedNoTable8Prompt}\`;`;

if (noTable8Pattern.test(pmContent)) {
    pmContent = pmContent.replace(noTable8Pattern, newNoTable8Def);
    console.log('✓ DEFAULT_BACKFILL_PROMPT_NO_TABLE8 替换成功\n');
} else {
    console.error('✗ 找不到 DEFAULT_BACKFILL_PROMPT_NO_TABLE8 模式\n');
    process.exit(1);
}

// Write the updated content back to prompt_manager.js
console.log('写入更新后的内容到 prompt_manager.js...');
fs.writeFileSync(PROMPT_MANAGER_FILE, pmContent, 'utf8');
console.log(`✓ 文件更新成功\n`);
console.log(`新文件长度: ${pmContent.length} 字符\n`);

console.log('✅ 批量填表（含表8）提示词更新完成！');
