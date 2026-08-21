import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { default: supabase } = await import('./lib/supabase.js');

async function inspectRounds() {
  console.log('--- Inspecting Rounds in Supabase ---');
  const { data: rounds, error } = await supabase.from('rounds').select('*');
  console.log('Rounds:', rounds, error);
}

inspectRounds().catch(err => console.error(err));
