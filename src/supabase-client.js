import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://nzqkejqaducsrfcmdcut.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY
// Create a single supabase client for interacting with your database
const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

supabase
  .from('*')
  .on('*', payload => {
    console.log('Change received!', payload)
  })
  .subscribe()

console.log(supabase)
export default supabase;