import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zltonbknwaxlqywxiuzx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdG9uYmtud2F4bHF5d3hpdXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MjE1NjgsImV4cCI6MjEwMzk5NzU2OH0.ei_8HPjt2C0SH0gMZI_5NAWaRdTFq6TkhY6pMpmdbjU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
