import * as Calendar from 'expo-calendar';
import {ReminderStatus} from 'expo-calendar';
import {Platform} from 'react-native';

// Calendar-related functions
export async function requestRemindersPermissions(): Promise<boolean> {
  const {status} = await Calendar.requestRemindersPermissionsAsync();
  return status === 'granted';
}

export async function getMemoryMateCalendar(): Promise<Calendar.Calendar | undefined> {
  const reminders = await Calendar.getCalendarsAsync(Calendar.EntityTypes.REMINDER);
  return reminders.find(cal => cal.title === 'Memory Mate');
}

export async function getDefaultCalendarSource() {
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return defaultCalendar.source;
}

export async function createMemoryMateCalendar(
  entityType: Calendar.EntityTypes = Calendar.EntityTypes.REMINDER,
  themeColor: string
): Promise<string | undefined> {
  try {
    // Double-check that the calendar doesn't already exist
    const existingCalendars = await Calendar.getCalendarsAsync(entityType);
    const existingCalendar = existingCalendars.find(cal => cal.title === 'Memory Mate');

    if (existingCalendar) {
      console.log(`Memory Mate calendar already exists with ID: ${existingCalendar.id}`);
      return existingCalendar.id;
    }

    // Create a new calendar only if it doesn't exist
    const defaultCalendarSource =
      Platform.OS === 'ios'
        ? await getDefaultCalendarSource()
        : {isLocalAccount: true, name: 'Expo Calendar'};

    const newCalendarID = await Calendar.createCalendarAsync({
      title: 'Memory Mate',
      color: themeColor,
      entityType: entityType,
      //@ts-expect-error
      sourceId: defaultCalendarSource.id,
      //@ts-expect-error
      source: defaultCalendarSource,
      name: 'Memory Mate',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER
    });

    console.log(`Created new calendar with ID: ${newCalendarID}`);
    return newCalendarID;
  } catch (error) {
    console.error('Error creating calendar:', error);
    return undefined;
  }
}

// OS Reminder functions
export async function createOSReminder(
  calendarId: string,
  reminderDetails: Calendar.Reminder
): Promise<string | undefined> {
  try {
    if (Platform.OS !== 'ios') {
      console.log('OS reminders are only supported on iOS');
      return undefined;
    }

    return await Calendar.createReminderAsync(calendarId, reminderDetails);
  } catch (error) {
    console.error('Error creating reminder in calendar:', error);
    return undefined;
  }
}

export async function syncRemindersFromOS(userId: string): Promise<void> {
  try {
    if (!userId) return;
    if (Platform.OS !== 'ios') return;

    // Request permissions first
    const {status} = await Calendar.requestRemindersPermissionsAsync();

    if (status !== 'granted') {
      console.log('Reminders permissions not granted');
      return;
    }

    // Get all reminder calendars
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.REMINDER);
    if (calendars.length === 0) {
      console.log('No reminder calendars found');
      return;
    }

    // Get all calendar IDs
    const reminderCalendarId = calendars.find(cal => cal.title === 'Memory Mate')?.id;
    if (!reminderCalendarId) {
      console.log('No reminder calendar found');
    }

    const dateLastWeek = new Date();
    dateLastWeek.setDate(dateLastWeek.getDate() - 7);

    const dateNextWeek = new Date();
    dateNextWeek.setDate(dateNextWeek.getDate() + 7);

    const reminders = await Calendar.getRemindersAsync([reminderCalendarId ?? ""], ReminderStatus.INCOMPLETE, dateLastWeek, dateNextWeek)

    if (!reminders || reminders.length === 0) {
      console.log("no reminders to sync")
      return
    }


    console.log('Synced reminders from OS');
  } catch (error) {
    console.error('Error syncing reminders from OS:', error);
  }
}

// Formatting functions
export function formatReminderDueDate(due_date?: string): string | undefined {
  return due_date ? `Due: ${new Date(due_date).toLocaleDateString(Intl.DateTimeFormat().resolvedOptions().locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })}` : undefined;
}