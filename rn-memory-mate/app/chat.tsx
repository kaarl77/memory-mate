import {StyleSheet, View} from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import {TextInput, useTheme} from "react-native-paper";
import {GiftedChat, IMessage, Bubble} from "react-native-gifted-chat";
import {useCallback, useEffect, useState} from "react";
import {Spacings} from "@/constants/Spacings";

export default function ModalScreen() {
  const [messages, setMessages] = useState<IMessage[]>([])
  const [textInputContent, setTextInputContent] = useState<string>('')

  const theme = useTheme()

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Memory Mate',
        },
      },
    ])
  }, [])

  const onSend = useCallback((message: IMessage) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, [message]),
    )
  }, [])

  return (
    <View style={{flex: 1, paddingBottom:Spacings["4x"], backgroundColor: theme.colors.background}}>
      <GiftedChat
        messages={messages}
        user={{
          _id: 1,
        }}
        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              textStyle={{
                left: {
                  color: theme.colors.background,
                },
                right: {
                  color: theme.colors.onPrimary,
              }}}
              wrapperStyle={{
                left: {
                  backgroundColor: theme.colors.onBackground,
                },
                right: {
                  backgroundColor: theme.colors.primary,
                }
              }}
            />
          )
        }}
        optionTintColor={theme.colors.primary}
        renderInputToolbar={(props) => {
          return (
            <TextInput
              placeholder={'Type a message...'}
              autoCapitalize={'none'}
              outlineStyle={{borderRadius: 999}}
              value={textInputContent}
              onChangeText={setTextInputContent}
              mode={'outlined'}
              style={{marginHorizontal: 24, height: Spacings["4x"]}}
              spellCheck={true}
              right={<TextInput.Icon icon={'send'} size={Spacings["2x"]} color={theme.colors.primary} onPress={()=>{
                onSend({
                  _id: messages.length + 1,
                  text: textInputContent,
                  createdAt: new Date(),
                  user: {
                    _id: 1,
                    name: 'user',
                  },
                })
                setTextInputContent('')
              }}/>}
            />
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
