import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { default: supabase } = await import('./lib/supabase.js');

async function testAlter() {
  console.log('Testing column type update on rounds.round_start_time...');
  
  // Try raw SQL via postgres/rpc if function exists, or let's test supabase sql
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE rounds ALTER COLUMN round_start_time TYPE TIMESTAMPTZ USING round_start_time AT TIME ZONE \'UTC\';'
  });

  console.log('RPC result:', data, error);
}

testAlter().catch(err => console.error(err));
