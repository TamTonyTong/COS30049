import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xsowlfczzjfhklzphkbl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzb3dsZmN6empmaGtsenBoa2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTE2NTgsImV4cCI6MjA1NjI4NzY1OH0.0PRlylZBUAKR4J1W-6Ob2e6DgOJlnwlA661yMlPzulE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);