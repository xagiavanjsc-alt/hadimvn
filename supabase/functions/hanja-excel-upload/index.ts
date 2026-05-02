// Edge Function to process Hanja Excel upload
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    // Read Excel file
    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Parse rows (Column A: Korean, Column B: Hanja, Column C: Content)
    const entries: any[] = [];
    const startIndex = data[0]?.[0] === 'Tiếng' || data[0]?.[0] === 'Korean' ? 1 : 0;

    for (let i = startIndex; i < data.length; i++) {
      const row = data[i];
      if (row[0] && row[1]) {
        entries.push({
          korean: String(row[0]).trim(),
          hanja: String(row[1]).trim(),
          vietnamese: row[2] ? String(row[2]).trim() : '',
        });
      }
    }

    // Sync to Supabase using RPC
    let created = 0;
    let errors = 0;

    for (const entry of entries) {
      const { data: result, error } = await supabase.rpc('upsert_hanja_entry', {
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

      if (error || !result?.success) {
        errors++;
      } else {
        created++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, created, errors, total: entries.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
