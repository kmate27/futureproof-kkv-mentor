import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dfgwnunsivhbzryyqtwo.supabase.co';
const supabaseAnonKey = 'sb_publishable_2iHtQJaDuZz4kYxsLbawIQ_Nqyfrll1';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Inserting demo data...');
  const { data, error } = await supabase
    .from('companies')
    .insert([{
      name: 'Kovács Bt.',
      industry: 'Kereskedelem',
      employee_count: '1-2',
      monthly_revenue_range: '12-25M Ft',
      tax_regime: 'KATA',
      main_expenses: ['Bérek', 'Készlet']
    }])
    .select();
    
  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Successfully inserted demo data:', data);
  }
}
run();
