import AsyncStorage from '@react-native-async-storage/async-storage'
import {createClient} from '@supabase/supabase-js'

const supabaseUrl = 'https://poofwlhyknkodkyteeqv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb2Z3bGh5a25rb2RreXRlZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MjM0MzEsImV4cCI6MjA0NzA5OTQzMX0.6va_5OXeedgZAIneWQ2KqtpGocAypdV7cDxB3Kwbbn8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})