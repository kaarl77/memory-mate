import AsyncStorage from '@react-native-async-storage/async-storage'
import {createClient} from '@supabase/supabase-js'
import {Database} from "@/database.types";

const supabaseUrl = 'https://poofwlhyknkodkyteeqv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvb2Z3bGh5a25rb2RreXRlZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MjM0MzEsImV4cCI6MjA0NzA5OTQzMX0.6va_5OXeedgZAIneWQ2KqtpGocAypdV7cDxB3Kwbbn8'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export type JournalEntry = {
  id?: string,
  title?: string
  content?: string
  created_at?: string
  updated_at?: string
}

export type Reminder = {
  id?: string
  title?: string
  description?: string
  due_date?: string
  created_at?: string
}

export function getYesterdaysLatestEntry(user_id: string){
  return supabase
    .from('entries')
    .select('content, title, created_at, updated_at')
    .eq('user_id', user_id)
    .lte('created_at', new Date().toISOString())
    .order('created_at', {ascending: false})
    .limit(1)
}

export function getUpcomingReminders(user_id: string){
  return supabase
    .from('os_reminders')
    .select('description, title, due_date')
    .eq('user_id', user_id)
    .gte('due_date', new Date().toISOString())
    .order('created_at', {ascending: true})
    .limit(2)
}