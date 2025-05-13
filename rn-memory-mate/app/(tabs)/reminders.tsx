import {Alert, FlatList, StyleSheet, View, ActivityIndicator} from "react-native";
import {Card, FAB, Text, useTheme} from "react-native-paper";
import {useEffect, useState} from "react";
import {Session} from "@supabase/auth-js";
import {Reminder, supabase} from "@/helpers/supabase";
import {Spacings} from "@/constants/Spacings";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useRouter} from "expo-router";
import {useIsFocused} from "@react-navigation/core";
import Spacer from "@/components/Spacer";
import * as Calendar from 'expo-calendar';
import {Platform} from "react-native";

export default function reminders() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [reminders, setReminders] = useState<Reminder[] | null>(null);
  const router = useRouter();
  const isFocused = useIsFocused();
  const [isAppRemindersInitialized, setIsAppRemindersInitialized] = useState<boolean>(false); // State variable to track whether the Memory Mate reminders calendar has been initialized
  const [appRemindersId, setAppRemindersId] = useState<string | undefined>(); // State variable to hold the ID of the Memory Mate reminders calendar

  const theme = useTheme();

  const onRefresh = async () => {
    setRefreshing(true);

    // Sync with OS reminders if on iOS
    if (Platform.OS === 'ios') {
      await syncRemindersFromOS();
    }

    // Get reminders from database
    await getReminders();

    setRefreshing(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // Initialize reminders calendar
  useEffect(() => {
    (async () => {
      const { status: remindersStatus } = await Calendar.requestRemindersPermissionsAsync();
      if (remindersStatus === 'denied' || remindersStatus === 'undetermined') {
        console.log('Reminders permission denied');
        return;
      }

      // Check if Memory Mate reminders calendar exists
      const reminders = await Calendar.getCalendarsAsync(Calendar.EntityTypes.REMINDER);
      const memoryMateCalendar = reminders.find(cal => cal.title === 'Memory Mate');
      
      if (memoryMateCalendar) {
        console.log('Found Memory Mate calendar during initialization:', memoryMateCalendar.id);
        setAppRemindersId(memoryMateCalendar.id);
        setIsAppRemindersInitialized(true);
      } else {
        setIsAppRemindersInitialized(false);
      }
    })().catch((error) => {
      console.error(error);
    });
  }, []);

  // Create the Memory Mate calendar if it doesn't exist
  useEffect(() => {
    if (isAppRemindersInitialized === false) {
      console.log('Reminders calendar is not initialized');
      // Check one more time to make sure we don't create duplicate calendars
      (async () => {
        const reminders = await Calendar.getCalendarsAsync(Calendar.EntityTypes.REMINDER);
        const existingCalendar = reminders.find(cal => cal.title === 'Memory Mate');
        
        if (existingCalendar) {
          // Calendar exists but wasn't detected in the first check
          console.log('Found existing Memory Mate calendar:', existingCalendar.id);
          setAppRemindersId(existingCalendar.id);
          setIsAppRemindersInitialized(true);
        } else {
          // Calendar truly doesn't exist, create it
          createCalendar(Calendar.EntityTypes.REMINDER);
        }
      })();
    } else if (isAppRemindersInitialized) {
      console.log('Reminders calendar is initialized');
      (async () => {
        const reminders = await Calendar.getCalendarsAsync(Calendar.EntityTypes.REMINDER);
        const reminder = reminders.find((reminder) => reminder.title === 'Memory Mate');
        if (reminder) {
          setAppRemindersId(reminder.id);
        }
      })();
    }
  }, [isAppRemindersInitialized]);

  useEffect(() => {
    if (session && isFocused) {
      getReminders();

      // When the screen is focused, try to sync with OS reminders
      if (Platform.OS === 'ios') {
        syncRemindersFromOS();
      }
    }
  }, [session, isFocused]);

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Spacer height={Spacings["3x"]}/>
      {loading && !refreshing ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Spacer height={Spacings["2x"]} />
          <Text>Loading reminders...</Text>
        </View>
      ) : (
        <FlatList
        contentContainerStyle={{gap: Spacings["1x"], flexGrow: 1}}
        data={reminders}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={() => (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50}}>
            <Text>No reminders found</Text>
            <Spacer height={Spacings["2x"]} />
            <Text>Pull down to refresh or tap + to create a new reminder</Text>
          </View>
        )}
        renderItem={({item}) => (
          <Card
            onPress={() => {
              openReminder(item);
            }}
            mode={'contained'}
          >
            <Card.Title
              title={item.title}
              subtitle={getCardSubtitle(item.due_date)}
            />
            <Card.Content>
              <Text numberOfLines={1}>{item.description}</Text>
            </Card.Content>
            <Card.Actions>
              <Ionicons 
                name={"pencil"} 
                size={Spacings["3x"]} 
                color={theme.colors.primary} 
                onPress={(e) => {
                  e.stopPropagation(); // Prevent card onPress from firing
                  openReminder(item);
                }}
                style={{marginRight: Spacings["2x"]}}
              />
              <Ionicons 
                name={"trash"} 
                size={Spacings["3x"]} 
                color={theme.colors.error} 
                onPress={(e) => {
                  e.stopPropagation(); // Prevent card onPress from firing
                  if (session?.user.id && item.id) {
                    console.log("deleting reminder");
                    deleteReminder(item.id, session.user.id).then(() => {
                      getReminders();
                    });
                  }
                }}
              />
            </Card.Actions>
          </Card>
        )}
      />
      )}
      <FAB
        onPress={createNewReminder}
        icon={"plus"}
        style={styles.fab}
      />
    </View>
  );

  async function getReminders() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const {data, error, status} = await supabase
        .from("os_reminders")
        .select("id, title, description, due_date, created_at")
        .eq("user_id", session?.user.id);

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setReminders(data);
      } else {
        // Ensure we set an empty array rather than null for better UX
        setReminders([]);
      }
    } catch (error) {
      console.log("error", error);
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
      // Set empty array on error to show empty state
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteReminder(reminderId: string, userId?: string) {
    try {
      await supabase
        .from("os_reminders")
        .delete()
        .eq("id", reminderId)
        .eq("user_id", userId ?? "0");
    } catch (e) {
      console.log("error", e);
      if (e instanceof Error) {
        Alert.alert(e.message);
      }
    }
  }

  async function createNewReminder() {
    // Navigate to the edit reminder screen to create a new reminder
    router.push('/editReminder');
  }

  async function saveReminderToDatabase(reminder: Reminder, userId: string) {
    try {
      await supabase
        .from('os_reminders')
        .insert([
          {
            "user_id": userId,
            title: reminder.title,
            description: reminder.description,
            due_date: reminder.due_date
          }
        ]);
    } catch (error) {
      console.error('Error saving reminder to database:', error);
    }
  }

  async function syncRemindersFromOS() {
    try {
      if (!session?.user.id) return;

      // Request permissions first
      const { status } = await Calendar.requestRemindersPermissionsAsync();

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
      const calendarIds = calendars.map(cal => cal.id);

      // We can't directly get reminders on iOS through the expo-calendar API
      // This is a limitation of the current implementation

      // Instead, we'll just refresh our database reminders
      getReminders();

      console.log('Synced reminders from OS');
    } catch (error) {
      console.error('Error syncing reminders from OS:', error);
    }
  }

  function openReminder(reminder: Reminder) {
    // Navigate to the edit reminder screen with the selected reminder
    router.push({
      pathname: '/editReminder',
      params: { reminder: JSON.stringify(reminder) }
    });
  }

  async function getDefaultCalendarSource() {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    return defaultCalendar.source;
  }

  async function createCalendar(entityType?: Calendar.EntityTypes) {
    try {
      // Double-check that the calendar doesn't already exist
      const existingCalendars = await Calendar.getCalendarsAsync(entityType ?? Calendar.EntityTypes.EVENT);
      const existingCalendar = existingCalendars.find(cal => cal.title === 'Memory Mate');
      
      if (existingCalendar) {
        console.log(`Memory Mate calendar already exists with ID: ${existingCalendar.id}`);
        if (entityType === Calendar.EntityTypes.REMINDER) {
          setAppRemindersId(existingCalendar.id);
          setIsAppRemindersInitialized(true);
        }
        return;
      }
      
      // Create a new calendar only if it doesn't exist
      const defaultCalendarSource =
        Platform.OS === 'ios'
          ? await getDefaultCalendarSource()
          : { isLocalAccount: true, name: 'Expo Calendar' };
          
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
      });
      
      console.log(`Created new calendar with ID: ${newCalendarID}`);
      
      if (entityType === Calendar.EntityTypes.REMINDER) {
        setAppRemindersId(newCalendarID);
        setIsAppRemindersInitialized(true);
      }
    } catch (error) {
      console.error('Error creating calendar:', error);
    }
  }
}

export function getCardSubtitle(due_date?: string): string | undefined {
  return due_date ? `Due: ${new Date(due_date).toLocaleDateString(Intl.DateTimeFormat().resolvedOptions().locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })}` : undefined;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacings["3x"]
  },
  fab: {
    position: 'absolute',
    margin: Spacings["3x"],
    right: 0,
    bottom: 0,
  }
});