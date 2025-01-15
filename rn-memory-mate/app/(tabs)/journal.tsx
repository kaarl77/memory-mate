import {Alert, FlatList, StyleSheet, View} from "react-native";
import {Card, FAB, Text, useTheme} from "react-native-paper";
import {useEffect, useState} from "react";
import {Session} from "@supabase/auth-js";
import {JournalEntry, supabase} from "@/helpers/supabase";
import {Spacings} from "@/constants/Spacings";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useRouter} from "expo-router";
import {useIsFocused} from "@react-navigation/core";
import Spacer from "@/components/Spacer";
import {Screen} from "react-native-screens";

export default function journal() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[] | null>(null)
  const router = useRouter()
  const isFocused = useIsFocused()

  const theme = useTheme()

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (session && isFocused) {
      getJournalEntries()
    }
  }, [session, isFocused]);

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Spacer height={Spacings["3x"]}/>
      <FlatList
        contentContainerStyle={{gap: Spacings["1x"]}}
        data={journalEntries}
        renderItem={({item}) => (
          <Card onPress={()=>{
            router.navigate({
              pathname: "/editJournalEntry",
              params: {
                entry: JSON.stringify(item)
              }
            })
          }}
                mode={'contained'}
          >
            <Card.Title
              title={item.title}
              subtitle={getCardSubtitle(item.created_at, item.updated_at)}
            />
            <Card.Content>
              <Text numberOfLines={1}>{item.content}</Text>
            </Card.Content>
            <Card.Actions>
              <Ionicons name={"pencil-outline"} size={Spacings["3x"]} color={theme.colors.primary}/>
              <Ionicons name={"trash"} size={Spacings["3x"]} color={theme.colors.error} onPress={() => {
                if (session?.user.id && item.id) {
                  console.log("deleting journal entry")
                  deleteJournalEntry(item.id, session.user.id).then(() => {
                    getJournalEntries()
                  })
                }
              }}/>
            </Card.Actions>
          </Card>
        )}
      />
      <FAB
        onPress={() => {
          router.navigate({
            pathname: "/editJournalEntry",
          })
        }}
        icon={"plus"}
        style={styles.fab}
      />
    </View>
  )

  async function getJournalEntries() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const {data, error, status} = await supabase
        .from("entries")
        .select("id, title, content, created_at, updated_at")
        .eq("user_id", session?.user.id)
      if (error && status !== 406) {
        throw error
      }
      if (data) {
        setJournalEntries(data)
      }
    } catch (error) {
      console.log("error", error)
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function deleteJournalEntry(entryId: string, userId?: string) {
    try {
      await supabase
        .from("entries")
        .delete()
        .eq("id", entryId)
        .eq("user_id", userId)
    } catch (e) {
      console.log("error", e)
      if (e instanceof Error) {
        Alert.alert(e.message)
      }
    }
  }
}

export function getCardSubtitle(created_at?: string, updated_at?: string): string | undefined {
  return updated_at ? `Updated: ${new Date(updated_at).toLocaleDateString(Intl.DateTimeFormat().resolvedOptions().locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })}` : created_at ? `Created: ${new Date(created_at).toLocaleDateString(Intl.DateTimeFormat().resolvedOptions().locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })} ` : undefined
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
})