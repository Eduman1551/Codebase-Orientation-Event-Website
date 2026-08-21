async function clean() {
  const supabase = (await import('./lib/supabase.js')).default;
  await supabase.from('teams').delete().eq('id', 'ab8cb7ba-66b5-4780-b189-eb209dc033d8');
  console.log("Team deleted");
}
clean();
