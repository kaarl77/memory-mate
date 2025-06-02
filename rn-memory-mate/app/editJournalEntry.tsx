import {StyleSheet, View, ViewStyle} from "react-native";
import {Button, Text, TextInput, useTheme} from "react-native-paper";
import Spacer from "@/components/Spacer";
import {Spacings} from "@/constants/Spacings";
import {useEffect, useState} from "react";
import {JournalEntry, supabase} from "@/helpers/supabase";
import {router, useLocalSearchParams, useNavigation} from "expo-router";

export default function editJournalEntry() {
  const theme = useTheme()

  const localSearchParams =useLocalSearchParams()
  const paramJournalEntry = localSearchParams.entry ? JSON.parse(localSearchParams.entry as string) as JournalEntry : undefined

  const [loading, setLoading] = useState<boolean>(false)
  const [entryTitle, setEntryTitle] = useState<string>(paramJournalEntry?.title ??'')
  const [entryContent, setEntryContent] = useState<string>(paramJournalEntry?.content ?? '')
  const [userId, setUserId] = useState<string>('')
  const navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions({
      headerTitle: paramJournalEntry?.id ? 'Edit Journal Entry' : 'New Journal Entry',
    })

    supabase.auth.getSession().then(({data: {session}}) => {
      if (session?.user.id) {
        setUserId(session?.user.id)
      }
    })
  }, [])

  const containerStyle: ViewStyle = {
    ...styles.container,
    backgroundColor: theme.colors.background
  }

  return (
    <View style={containerStyle}>
      <Spacer height={Spacings["3x"]}/>
      <TextInput label="Title" mode={'outlined'} placeholder={"Title"} value={entryTitle} onChangeText={setEntryTitle}/>
      <Spacer height={Spacings["2x"]}/>
      <TextInput label="Content" mode={'outlined'} placeholder={"Content"} multiline={true} numberOfLines={10}
                 value={entryContent} onChangeText={setEntryContent}/>
      <View style={styles.buttonContainer}>
        <Button loading={loading} mode={'contained'} onPress={() => {
          if(paramJournalEntry?.id) {
            editJournalEntry(userId, paramJournalEntry.id)
          }
          else {
            saveJournalEntry(userId)
          }
        }}>
          Save
        </Button>
      </View>
    </View>
  )

  async function saveJournalEntry(userId: string) {
    try {
      setLoading(true)
      await supabase
        .from('entries')
        .insert([
          {
            "user_id": userId,
            title: entryTitle,
            content: entryContent
          }
        ])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      router.back()
    }
  }

  async function editJournalEntry(userId: string, entryId: string) {
    try {
      setLoading(true)
      await supabase
        .from('entries')
        .update({
          title: entryTitle,
          content: entryContent,
          "user_id": userId,
          "updated_at": new Date().toISOString()
        })
        .eq('id', entryId)
        .eq('user_id', userId)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      router.back()
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
  }
})