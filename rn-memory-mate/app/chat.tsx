import { Platform, StyleSheet, View } from 'react-native'
import { TextInput, useTheme } from 'react-native-paper'
import { Bubble, GiftedChat, IMessage } from 'react-native-gifted-chat'
import { useCallback, useEffect, useState } from 'react'
import { Spacings } from '@/constants/Spacings'
import OpenAI from 'openai'
import { getCalendarReminderFromMessage, getOpenAIAgent } from '@/helpers/openai_agent'
import * as Calendar from 'expo-calendar'


export default function ModalScreen() {
  const theme = useTheme()

  const [openai, setOpenai] = useState<OpenAI>()

  const [messages, setMessages] = useState<IMessage[]>([])
  const [textInputContent, setTextInputContent] = useState<string>('')

  const [isAppCalendarInitialised, setIsAppCalendarInitialised] = useState<boolean | undefined>()
  const [appCalendarId, setAppCalendarId] = useState<string | undefined>()
  const [isAppRemindersInitialised, setIsAppRemindersInitialised] = useState<boolean | undefined>()
  const [appRemindersId, setAppRemindersId] = useState<string | undefined>()

  useEffect(() => {
    getOpenAIAgent().then((agent) => {
      setOpenai(agent)
    })
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Memory Mate'
        }
      }
    ])
  }, [])

  useEffect(() => {
    (async () => {
      const { status: calendarStatus } = await Calendar.requestCalendarPermissionsAsync()
      const { status: remindersStatus } = await Calendar.requestRemindersPermissionsAsync()
      if (calendarStatus === 'denied' || calendarStatus === 'undetermined') throw new Error('Calendar permission denied')
      if (remindersStatus === 'denied' || remindersStatus === 'undetermined') throw new Error('Reminders permission denied')
    })().then(() => {
      (async () => {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
        const reminders = await Calendar.getCalendarsAsync(Calendar.EntityTypes.REMINDER)
        const calendarTitles = calendars.map((calendar) => calendar.title)
        const reminderTitles = reminders.map((reminder) => reminder.title)
        setIsAppCalendarInitialised(calendarTitles.includes('Memory Mate'))
        setIsAppRemindersInitialised(reminderTitles.includes('Memory Mate'))
      })()
    })
      .catch((error) => {
          console.error(error)
        }
      )
  }, [])

  useEffect(() => {
    (async () => {
      if (isAppCalendarInitialised) {
        console.log('Calendar is initialised')
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
        const calendar = calendars.find((calendar) => calendar.title === 'Memory Mate')
        setAppCalendarId(calendar?.id)
      }
      if (isAppCalendarInitialised === false) {
        console.log('Calendar is not initialised')
        createCalendar()
      }
      if (isAppRemindersInitialised) {
        console.log('Reminders is initialised')
        const reminders = await Calendar.getCalendarsAsync(Calendar.EntityTypes.REMINDER)
        const reminder = reminders.find((reminder) => reminder.title === 'Memory Mate')
        setAppRemindersId(reminder?.id)
      }
      if (isAppRemindersInitialised === false) {
        console.log('Reminders is not initialised')
        createCalendar(Calendar.EntityTypes.REMINDER)
      }
    })()

  }, [isAppCalendarInitialised, isAppRemindersInitialised])


  const onSend = useCallback((message: IMessage) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, [message])
    )
  }, [])

  return (
    <View style={{ flex: 1, paddingBottom: Spacings['4x'], backgroundColor: theme.colors.background }}>
      <GiftedChat
        messages={messages}
        user={{
          _id: 1
        }}
        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              textStyle={{
                left: {
                  color: theme.colors.background
                },
                right: {
                  color: theme.colors.onPrimary
                }
              }}
              wrapperStyle={{
                left: {
                  backgroundColor: theme.colors.onBackground
                },
                right: {
                  backgroundColor: theme.colors.primary
                }
              }}
            />
          )
        }}
        optionTintColor={theme.colors.primary}
        renderInputToolbar={() => {
          return (
            <TextInput
              placeholder={'Type a message...'}
              autoCapitalize={'none'}
              outlineStyle={{ borderRadius: 999 }}
              value={textInputContent}
              onChangeText={setTextInputContent}
              mode={'outlined'}
              style={{ marginHorizontal: 24, height: Spacings['4x'] }}
              spellCheck={true}
              right={
                <TextInput.Icon
                  icon={'send'}
                  size={Spacings['2x']}
                  color={theme.colors.primary}
                  onPress={() => {
                    const message: IMessage = {
                      _id: messages.length + 1,
                      text: textInputContent,
                      createdAt: new Date(),
                      user: {
                        _id: 1,
                        name: 'user'
                      }
                    }
                    onSend(message)
                    setTextInputContent('')
                    getCalendarReminderFromMessage(openai, message).then((response) => {
                      console.log(response)
                      if (appRemindersId && isReminderObject(response?.reminder)) {
                        Calendar.createReminderAsync(appRemindersId, {
                          title: response?.reminder.title,
                          startDate: new Date(response?.reminder.startDate ?? ''),
                          notes: response?.reminder.notes,
                          dueDate: new Date(response?.reminder.dueDate ?? '')

                        }).then((value) => {
                          console.log(value)
                        })
                          .catch((error) => {
                            console.error(error)
                          })
                      }
                    })
                  }}
                />
              }
            />
          )
        }}
      />
    </View>
  )

  async function getDefaultCalendarSource() {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync()
    return defaultCalendar.source
  }

  async function createCalendar(entityType?: Calendar.EntityTypes) {
    const defaultCalendarSource =
      Platform.OS === 'ios'
        ? await getDefaultCalendarSource()
        : { isLocalAccount: true, name: 'Expo Calendar' }
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

  function isReminderObject(reminder: any): reminder is {
    title?: string;
    startDate?: string;
    notes?: string;
    dueDate?: string
  } {
    return typeof reminder === 'object' && reminder !== null
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%'
  }
})