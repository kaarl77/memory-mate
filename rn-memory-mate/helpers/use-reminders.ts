import {useEffect, useState} from "react";
import {
  getDefaultCalendarSource,
  getMemoryMateCalendar,
  requestRemindersPermissions
} from "@/helpers/reminders-helpers";
import * as Calendar from "expo-calendar";
import {Platform} from "react-native";
import {useTheme} from "react-native-paper";

export function useReminders() {
  const [appRemindersId, setAppRemindersId] = useState<string>();
  const [appCalendarId, setAppCalendarId] = useState<string>();
  const [isAppRemindersInitialised, setIsAppRemindersInitialised] = useState(false);
  const [isAppCalendarInitialised, setIsAppCalendarInitialised] = useState(false);

  const theme = useTheme()

  useEffect(() => {
    (async () => {
      const {status: calendarStatus} = await Calendar.requestCalendarPermissionsAsync()
      const {status: remindersStatus} = await Calendar.requestRemindersPermissionsAsync()
      if (calendarStatus === 'denied' || calendarStatus === 'undetermined') throw new Error('Calendar permission denied')
      if (remindersStatus === 'denied' || remindersStatus === 'undetermined') throw new Error('Reminders permission denied')

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
      const reminders = await Calendar.getCalendarsAsync(Calendar.EntityTypes.REMINDER)
      const calendarTitles = calendars.map((calendar) => calendar.title)
      const reminderTitles = reminders.map((reminder) => reminder.title)
      const isAppCalendarInitialised = calendarTitles.includes('Memory Mate')
      const isAppRemindersInitialised = reminderTitles.includes('Memory Mate')

      if (isAppCalendarInitialised) {
        console.log('Calendar is initialised')
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
        const calendar = calendars.find((calendar) => calendar.title === 'Memory Mate')
        setAppCalendarId(calendar?.id)
      }
      if (!isAppCalendarInitialised) {
        console.log('Calendar is not initialised')
        createCalendar()
      }
      if (isAppRemindersInitialised) {
        console.log('Reminders is initialised')
        const reminders = await Calendar.getCalendarsAsync(Calendar.EntityTypes.REMINDER)
        const reminder = reminders.find((reminder) => reminder.title === 'Memory Mate')
        setAppRemindersId(reminder?.id)
      }
      if (!isAppRemindersInitialised) {
        console.log('Reminders is not initialised')
        createCalendar(Calendar.EntityTypes.REMINDER)
      }

      setIsAppCalendarInitialised(isAppCalendarInitialised)
      setIsAppRemindersInitialised(isAppRemindersInitialised)
    })()
      .catch((error) => {
        console.error('Error initialising app calendar and index:', error)
      })
  }, []);

  async function createCalendar(entityType?: Calendar.EntityTypes) {
    const defaultCalendarSource =
      Platform.OS === 'ios'
        ? await getDefaultCalendarSource()
        : {isLocalAccount: true, name: 'Expo Calendar'}
    const newCalendarID = await Calendar.createCalendarAsync({
      title: 'Memory Mate',
      color: theme.colors.primary,
      entityType: entityType ?? Calendar.EntityTypes.EVENT,
      //@ts-expect-error
      sourceId: defaultCalendarSource.id,
      //@ts-expect-error
      source: defaultCalendarSource,
      name: 'Memory Mate',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER
    })
    console.log(`Your new calendar ID is: ${newCalendarID}`)
    if (entityType === Calendar.EntityTypes.REMINDER) {
      setAppRemindersId(newCalendarID)
    } else {
      setAppCalendarId(newCalendarID)
    }
  }

  return {
    appRemindersId,
    appCalendarId,
    isAppRemindersInitialised,
    isAppCalendarInitialised
  }
}