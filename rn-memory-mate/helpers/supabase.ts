import AsyncStorage from '@react-native-async-storage/async-storage'
import {createClient} from '@supabase/supabase-js'
import {Database} from "@/database.types";
import { Alert } from 'react-native';

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
  id?: string | null
  title?: string | null
  description?: string | null
  due_date?: string | null
  created_at?: string | null
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

// Reminder-specific Supabase functions
export async function getUserReminders(userId: string): Promise<Reminder[]> {
  try {
    if (!userId) {
      console.log("Error: No user ID provided");
      Alert.alert('No user ID provided');
      return [];
    }

    const {data, error, status} = await supabase
      .from("os_reminders")
      .select("id, title, description, due_date, created_at")
      .eq("user_id", userId);

    if (error && status !== 406) {
      console.log("Error fetching reminders:", error);
      Alert.alert(error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.log("Error fetching reminders:", error);
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
    return [];
  }
}

export async function deleteUserReminder(reminderId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("os_reminders")
      .delete()
      .eq("id", reminderId)
      .eq("user_id", userId);
      
    if (error) {
      console.log("Error deleting reminder:", error);
      Alert.alert(error.message);
      return false;
    }
    
    return true;
  } catch (e) {
    console.log("Error deleting reminder:", e);
    if (e instanceof Error) {
      Alert.alert(e.message);
    }
    return false;
  }
}

export async function createUserReminder(reminder: Reminder, userId: string): Promise<Reminder | null> {
  try {
    const { data, error } = await supabase
      .from('os_reminders')
      .insert([
        {
          "user_id": userId,
          title: reminder.title,
          description: reminder.description,
          due_date: reminder.due_date
        }
      ])
      .select();
      
    if (error) {
      console.error('Error creating reminder:', error);
      Alert.alert(error.message);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error creating reminder:', error);
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
    return null;
  }
}

export async function updateUserReminder(reminder: Reminder, userId: string): Promise<boolean> {
  try {
    if (!reminder.id) {
      console.error('Error: No reminder ID provided');
      Alert.alert('No reminder ID provided');
      return false;
    }
    
    const { error } = await supabase
      .from('os_reminders')
      .update({
        title: reminder.title,
        description: reminder.description,
        due_date: reminder.due_date,
      })
      .eq('id', reminder.id)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating reminder:', error);
      Alert.alert(error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating reminder:', error);
    if (error instanceof Error) {
      Alert.alert(error.message);
    }
    return false;
  }
}