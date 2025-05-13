import {StyleSheet, View, ViewStyle, Platform, Alert} from "react-native";
import {Button, Text, TextInput, useTheme, HelperText} from "react-native-paper";
import Spacer from "@/components/Spacer";
import {Spacings} from "@/constants/Spacings";
import {useEffect, useState} from "react";
import {Reminder, createUserReminder, updateUserReminder, supabase} from "@/helpers/supabase";
import {router, useLocalSearchParams} from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';
import {
  requestRemindersPermissions,
  getMemoryMateCalendar,
  createMemoryMateCalendar,
  createOSReminder
} from "@/helpers/reminders-helpers";
import {useReminders} from "@/helpers/use-reminders";

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

  const {appRemindersId} = useReminders()

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      if (session?.user.id) {
        setUserId(session?.user.id);
      }
    });
  }, []);


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
              handleUpdateReminder(userId, paramReminder.id);
            } else {
              handleCreateReminder(userId);
            }
          }}
          disabled={!reminderTitle.trim()}
        >
          Save
        </Button>
      </View>
    </View>
  );

  async function handleCreateReminder(userId: string) {
    try {
      setLoading(true);
      
      // Create reminder object
      const reminderData: Reminder = {
        title: reminderTitle,
        description: reminderDescription,
        due_date: dueDate.toISOString()
      };
      
      // First save to database
      const newReminder = await createUserReminder(reminderData, userId);
      
      if (!newReminder) {
        throw new Error('Failed to create reminder in database');
      }
      
      // Then create in OS calendar if on iOS
      if (Platform.OS === 'ios' && appRemindersId) {
        // Create the reminder in the OS
        const reminderDetails: Calendar.Reminder = {
          title: reminderTitle,
          startDate: new Date(),
          notes: reminderDescription,
          dueDate: dueDate
        };
        
        await createOSReminder(appRemindersId, reminderDetails);
      }
      
      router.back();
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert('Error', 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateReminder(userId: string, reminderId: string) {
    try {
      setLoading(true);
      
      // Create reminder object
      const reminderData: Reminder = {
        id: reminderId,
        title: reminderTitle,
        description: reminderDescription,
        due_date: dueDate.toISOString()
      };
      
      // Update in database
      const success = await updateUserReminder(reminderData, userId);
      
      if (!success) {
        throw new Error('Failed to update reminder in database');
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
      
      router.back();
    } catch (error) {
      console.error('Error updating reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    } finally {
      setLoading(false);
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