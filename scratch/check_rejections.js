const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = val;
      }
    }
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .order('verified_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching verifications:', error);
    return;
  }

  console.log('Latest verifications logs:');
  data.forEach((v, i) => {
    console.log(`\n--- Verification #${i+1} ---`);
    console.log(`ID: ${v.id}`);
    console.log(`Slot ID: ${v.slot_id}`);
    console.log(`Status: ${v.status}`);
    console.log(`Views Extracted: ${v.views_extracted}`);
    console.log(`Fraud Score: ${v.fraud_score}`);
    console.log(`Is Valid: ${v.is_valid}`);
    console.log(`Rejection Reason: ${v.rejection_reason}`);
    console.log(`Gemini Raw Response: ${JSON.stringify(v.gemini_raw_response, null, 2)}`);
  });
}

main();
