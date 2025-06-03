import {Platform, ScrollView, StyleSheet, View} from 'react-native'
import {Button, TextInput, useTheme, Text, IconButton} from 'react-native-paper'
import {Bubble, GiftedChat, IMessage} from 'react-native-gifted-chat'
import {useCallback, useEffect, useState} from 'react'
import {Spacings} from '@/constants/Spacings'
import OpenAI from 'openai'
import {getCalendarReminderFromMessage, getOpenAIAgent} from '@/helpers/openai_agent'
import * as Calendar from 'expo-calendar'
import {useReminders} from "@/helpers/use-reminders";
import {ExpoSpeechRecognitionModule, useSpeechRecognitionEvent} from "expo-speech-recognition";


export default function ModalScreen() {
  const theme = useTheme()

  const [openai, setOpenai] = useState<OpenAI>()

  const [messages, setMessages] = useState<IMessage[]>([])
  const [textInputContent, setTextInputContent] = useState<string>('')

  const {appRemindersId} = useReminders()

  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");

  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => setRecognizing(false));
  useSpeechRecognitionEvent("result", (event) => {
    setTranscript(event.results[0]?.transcript);
    setTextInputContent(event.results[0]?.transcript)
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("error code:", event.error, "error message:", event.message);
  });

  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted", result);
      return;
    }
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "ro-RO",
      interimResults: true,
      continuous: false,
      addsPunctuation: true
    });
  };

  useEffect(() => {
    getOpenAIAgent().then((agent) => {
      setOpenai(agent)
    })
    setMessages([
      {
        _id: 1,
        text: `Hi there! How can I help you with? I'm happy to help you manage your calendar!`,
        createdAt: new Date(),
        pending: false,
        sent: true,
        received: true,
        user: {
          _id: 2,
          name: 'Memory Mate'
        }
      }
    ])
  }, [])


  const onSend = useCallback((message: IMessage) => {
    // Add the message with pending status
    const pendingMessage: IMessage = {
      ...message,
      pending: true,
      sent: false,
      received: false
    }
    
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, [pendingMessage])
    )
    
    return pendingMessage
  }, [])

  return (
    <View style={{flex: 1, paddingBottom: Spacings['4x'], backgroundColor: theme.colors.background}}>
      <View style={styles.microphoneContainer}>
        <IconButton
          icon={recognizing ? 'microphone' : 'microphone-outline'}
          size={30}
          mode={recognizing ? 'contained' : 'outlined'}
          iconColor={recognizing ? theme.colors.onPrimary : theme.colors.primary}
          containerColor={recognizing ? theme.colors.primary : 'transparent'}
          onPress={recognizing ? () => ExpoSpeechRecognitionModule.stop() : handleStart}
          animated={true}
        />
      </View>

      <GiftedChat
        messages={messages}
        user={{
          _id: 1
        }}
        messagesContainerStyle={{
          paddingVertical: Spacings["2x"]
        }}
        renderBubble={(props) => {
          // Get the message status
          const message = props.currentMessage;
          
          // Define styles based on status
          const getRightBubbleStyle = () => {
            if (message?.pending) {
              return {
                backgroundColor: theme.colors.primary + '80', // 50% opacity for pending
              };
            } else if (!message?.sent) {
              return {
                backgroundColor: theme.colors.error, // Error state
              };
            } else {
              return {
                backgroundColor: theme.colors.primary, // Sent state
              };
            }
          };
          
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
                  backgroundColor: theme.colors.onBackground,
                },
                right: getRightBubbleStyle(),
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
              outlineStyle={{borderRadius: 999}}
              value={textInputContent}
              onChangeText={setTextInputContent}
              mode={'outlined'}
              style={{marginHorizontal: 24, height: Spacings['4x']}}
              spellCheck={true}
              right={
                <TextInput.Icon
                  icon={'send'}
                  size={Spacings['2x']}
                  color={theme.colors.primary}
                  onPress={() => {
                    if (!textInputContent.trim()) return;
                    
                    const message: IMessage = {
                      _id: messages.length + 1,
                      text: textInputContent,
                      createdAt: new Date(),
                      user: {
                        _id: 1,
                        name: 'user'
                      }
                    }
                    
                    // Send message with pending status
                    const pendingMessage = onSend(message);
                    setTextInputContent('');
                    
                    // Process the message
                    getCalendarReminderFromMessage(openai, pendingMessage).then((response) => {
                      console.log(response);
                      
                      if (appRemindersId && isReminderObject(response?.reminder)) {
                        // Create the reminder
                        Calendar.createReminderAsync(appRemindersId, {
                          title: response?.reminder.title,
                          startDate: new Date(response?.reminder.startDate ?? ''),
                          notes: response?.reminder.notes,
                          dueDate: new Date(response?.reminder.dueDate ?? '')
                        }).then((value) => {
                          console.log(value);
                          
                          // Update message status to sent
                          setMessages(previousMessages => 
                            previousMessages.map(msg => 
                              msg._id === pendingMessage._id 
                                ? { ...msg, pending: false, sent: true, received: true } 
                                : msg
                            )
                          );
                        })
                        .catch((error) => {
                          console.error(error);
                          
                          // Update message status to error (not sent)
                          setMessages(previousMessages => 
                            previousMessages.map(msg => 
                              msg._id === pendingMessage._id 
                                ? { ...msg, pending: false, sent: false } 
                                : msg
                            )
                          );
                        });
                      } else {
                        // If no reminder was created, still mark as sent
                        setMessages(previousMessages => 
                          previousMessages.map(msg => 
                            msg._id === pendingMessage._id 
                              ? { ...msg, pending: false, sent: true, received: true } 
                              : msg
                          )
                        );
                      }
                    });
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
  },
  microphoneContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacings["1x"],
  }
})