// Replace hardcoded colors with design tokens
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '../src');

// Color replacements map
const replacements = [
  // Background colors
  [/bg-\[#0f1117\]/g, 'bg-app-bg'],
  [/bg-\[#1a1d24\]/g, 'bg-app-surface'],
  [/bg-\[#22262d\]/g, 'bg-app-card'],
  
  // Accent colors
  [/bg-\[#e8c84a\]/g, 'bg-app-accent-primary'],
  [/text-\[#e8c84a\]/g, 'text-app-accent-primary'],
  [/border-\[#e8c84a\]/g, 'border-app-accent-primary'],
  [/#e8c84a/g, 'app-accent-primary'], // Catch all other instances
  
  // Text colors
  [/text-\[#0f1117\]/g, 'text-app-bg'],
  [/text-white\/40/g, 'text-app-text-secondary'],
  [/text-white\/30/g, 'text-app-text-muted'],
  [/text-white\/25/g, 'text-app-text-muted'],
  [/text-white\/20/g, 'text-app-text-muted'],
  
  // Border colors
  [/border-white\/5/g, 'border-app-border'],
  [/border-white\/10/g, 'border-app-border'],
  [/border-white\/8/g, 'border-app-border'],
  
  // Background with opacity
  [/bg-white\/3/g, 'bg-app-surface/50'],
  [/bg-white\/5/g, 'bg-app-card/50'],
  [/bg-white\/10/g, 'bg-app-card/70'],
  [/bg-white\/20/g, 'bg-app-border/200'],
  
  // Gradient backgrounds
  [/from-\[#1a1600\]/g, 'from-app-surface'],
  
  // Error colors
  [/text-red-400\/60/g, 'text-app-accent-error/60'],
  
  // Success colors
  [/text-emerald-400\/60/g, 'text-app-accent-success/60'],
  [/bg-emerald-500\/15/g, 'bg-app-accent-success/15'],
  [/text-emerald-400/g, 'text-app-accent-success'],
  
  // Dark backgrounds
  [/bg-\[#1a1a2e\]/g, 'bg-app-surface'],
];

function processFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  let newContent = content;
  let changed = false;

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, replacement);
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(filePath, newContent);
    return true;
  }
  return false;
}

function processDirectory(dir, excludeDirs = ['node_modules', 'dist', '.git']) {
  let changedCount = 0;
  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = join(dir, file.name);
    
    if (file.isDirectory()) {
      if (!excludeDirs.includes(file.name)) {
        changedCount += processDirectory(fullPath, excludeDirs);
      }
    } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts') || file.name.endsWith('.jsx') || file.name.endsWith('.js'))) {
      if (processFile(fullPath)) {
        changedCount++;
        console.log(`✓ Fixed: ${fullPath}`);
      }
    }
  }

  return changedCount;
}

console.log('🎨 Fixing colors in source files...');
const changed = processDirectory(srcDir);
console.log(`\n✅ Done! ${changed} files updated.`);
