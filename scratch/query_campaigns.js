const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching campaigns with profiles...");
  const { data, error } = await supabase
    .from("campaigns")
    .select(`
      id,
      title,
      business_id,
      business:profiles(
        id,
        full_name,
        role
      )
    `);

  if (error) {
    console.error("Supabase error:", error);
  } else {
    console.log("Campaigns found in DB:", JSON.stringify(data, null, 2));
  }
}

run();
