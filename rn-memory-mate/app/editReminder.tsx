import {StyleSheet, View, ViewStyle, Platform, Alert} from "react-native";
import {Button, Text, TextInput, useTheme, HelperText} from "react-native-paper";
import Spacer from "@/components/Spacer";
import {Spacings} from "@/constants/Spacings";
import {useEffect, useState} from "react";
import {Reminder, supabase} from "@/helpers/supabase";
import {router, useLocalSearchParams} from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';

export default function EditReminder() {
  const theme = useTheme();

  const localSearchParams = useLocalSearchParams();
  const paramReminder = localSearchParams.reminder ? JSON.parse(localSearchParams.reminder as string) as Reminder : undefined;

  const [loading, setLoading] = useState<boolean>(false);
  const [reminderTitle, setReminderTitle] = useState<string>(paramReminder?.title ?? '');
  const [reminderDescription, setReminderDescription] = useState<string>(paramReminder?.description ?? '');
  const [dueDate, setDueDate] = useState<Date>(paramReminder?.due_date ? new Date(paramReminder.due_date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');
  const [isAppRemindersInitialized, setIsAppRemindersInitialized] = useState<boolean>(false);
  const [appRemindersId, setAppRemindersId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      if (session?.user.id) {
        setUserId(session?.user.id);
      }
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
    if (!isAppRemindersInitialized) {
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

  const containerStyle: ViewStyle = {
    ...styles.container,
    backgroundColor: theme.colors.background
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDueDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={containerStyle}>
      <Spacer height={Spacings["3x"]}/>
      <TextInput 
        label="Title" 
        mode={'outlined'} 
        placeholder={"Reminder Title"} 
        value={reminderTitle} 
        onChangeText={setReminderTitle}
      />
      <Spacer height={Spacings["2x"]}/>
      <TextInput 
        label="Description" 
        mode={'outlined'} 
        placeholder={"Description"} 
        multiline={true} 
        numberOfLines={5}
        value={reminderDescription} 
        onChangeText={setReminderDescription}
      />
      <Spacer height={Spacings["2x"]}/>
      
      <Text>Due Date:</Text>
      <Button 
        mode="outlined" 
        onPress={showDatepicker} 
        style={styles.dateButton}
      >
        {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </Button>
      
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={dueDate}
          mode="datetime"
          display="default"
          onChange={onDateChange}
        />
      )}
      
      <HelperText type="info">
        {paramReminder?.id ? 'Editing an existing reminder' : 'Creating a new reminder'}
      </HelperText>
      
      <View style={styles.buttonContainer}>
        <Button 
          loading={loading} 
          mode={'contained'} 
          onPress={() => {
            if (paramReminder?.id) {
              updateReminder(userId, paramReminder.id);
            } else {
              createReminder(userId);
            }
          }}
          disabled={!reminderTitle.trim()}
        >
          Save
        </Button>
      </View>
    </View>
  );

  async function createReminder(userId: string) {
    try {
      setLoading(true);
      
      // First save to database
      const { data, error } = await supabase
        .from('os_reminders')
        .insert([
          {
            "user_id": userId,
            title: reminderTitle,
            description: reminderDescription,
            due_date: dueDate.toISOString()
          }
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      // Then create in OS calendar if on iOS
      if (Platform.OS === 'ios' && appRemindersId) {
        try {
          // Create the reminder in the OS
          const reminderDetails: Calendar.Reminder = {
            title: reminderTitle,
            startDate: new Date(),
            notes: reminderDescription,
            dueDate: dueDate
          };
          
          await Calendar.createReminderAsync(appRemindersId, reminderDetails);
        } catch (calendarError) {
          console.error('Error creating reminder in calendar:', calendarError);
          // We don't throw here because we already saved to database
        }
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert('Error', 'Failed to create reminder');
    } finally {
      setLoading(false);
      router.back();
    }
  }

  async function updateReminder(userId: string, reminderId: string) {
    try {
      setLoading(true);
      
      // Update in database
      const { error } = await supabase
        .from('os_reminders')
        .update({
          title: reminderTitle,
          description: reminderDescription,
          due_date: dueDate.toISOString(),
        })
        .eq('id', reminderId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      // We can't easily update the OS reminder since we don't store the native ID
      // Instead, inform the user that they may need to update the OS reminder manually
      if (Platform.OS === 'ios') {
        Alert.alert(
          'Reminder Updated',
          'The reminder has been updated in Memory Mate. You may need to manually update it in your iOS Reminders app.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    } finally {
      setLoading(false);
      router.back();
    }
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacings["3x"],
    paddingBottom: Spacings["5x"],
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dateButton: {
    marginTop: Spacings["1x"],
    marginBottom: Spacings["2x"],
  }
});