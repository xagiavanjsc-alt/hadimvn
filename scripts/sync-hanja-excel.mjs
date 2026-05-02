// Sync Hanja from Excel file to Supabase
// Format: Column A = Korean, Column B = Hanja, Column C = eBook Content
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import xlsx from 'xlsx';

// Load environment variables from .env or .env.local
const envPaths = [
  new URL('../.env', import.meta.url),
  new URL('../.env.local', import.meta.url),
];

for (const envPath of envPaths) {
  try {
    const envText = readFileSync(envPath, 'utf8');
    for (const line of envText.split('\n')) {
      if (line.includes('=') && !line.trim().startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
          process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    }
  } catch (e) {
    // File doesn't exist, continue
  }
}

const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment');
  console.log('Create .env.local with:');
  console.log('VITE_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Excel file path - change this to your file
const excelPath = new URL('../src/pages/lexicon/Phan_1.xlsx', import.meta.url).pathname;

console.log('📂 Reading Excel file:', excelPath);

// Read Excel
let entries = [];
try {
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }); // Read as array of arrays

  console.log(`📊 Found ${data.length} rows in sheet: ${sheetName}`);

  // Skip header row if exists (check first row)
  const startIndex = data[0]?.[0] === 'Tiếng' || data[0]?.[0] === 'Korean' ? 1 : 0;

  for (let i = startIndex; i < data.length; i++) {
    const row = data[i];
    if (row[0] && row[1]) { // Must have Korean and Hanja
      entries.push({
        korean: String(row[0]).trim(),
        hanja: String(row[1]).trim(),
        vietnamese: row[2] ? String(row[2]).trim() : '',
      });
    }
  }

  console.log(`✓ Parsed ${entries.length} valid entries`);
} catch (e) {
  console.error('❌ Error reading Excel:', e.message);
  console.log('\n💡 Install xlsx package: npm install xlsx');
  process.exit(1);
}

// Sync to Supabase using RPC
async function syncToDB() {
  console.log('\n🚀 Starting sync to Supabase...');
  
  let created = 0;
  let errors = 0;
  const BATCH_SIZE = 100;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    
    for (const entry of batch) {
      try {
        const { data, error } = await supabase.rpc('upsert_hanja_entry', {
          p_korean: entry.korean,
          p_hanja: entry.hanja,
          p_vietnamese: entry.vietnamese,
          p_pronunciation: null,
          p_category: 'Khác',
          p_difficulty: 2,
          p_topik_level: null,
          p_examples: [],
          p_memory_tip: null,
          p_related_words: [],
        });

        if (error) {
          console.error(`❌ Error syncing ${entry.korean}:`, error.message);
          errors++;
        } else if (data?.success) {
          created++;
        } else {
          console.error(`❌ RPC returned false for ${entry.korean}:`, data?.error);
          errors++;
        }
      } catch (err) {
        console.error(`❌ Exception syncing ${entry.korean}:`, err.message);
        errors++;
      }
    }

    console.log(`  Progress: ${Math.min(i + BATCH_SIZE, entries.length)}/${entries.length}`);
  }

  console.log('\n✅ Sync complete!');
  console.log(`   Created/Updated: ${created}`);
  console.log(`   Errors: ${errors}`);
}

syncToDB().catch(console.error);
