import {Alert, FlatList, StyleSheet, View} from "react-native";
import {Card, Text, useTheme} from "react-native-paper";
import {useEffect, useState} from "react";
import {Session} from "@supabase/auth-js";
import {JournalEntry, supabase} from "@/helpers/supabase";
import {Spacings} from "@/constants/Spacings";

export default function journal() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[] | null>(null)

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
    if (session) {
      console.log("session active, retrieving journal entries")
      getJournalEntries()
    }
  }, [session]);

  return (
    <FlatList
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      data={journalEntries}
      renderItem={({item}) => (
        <Card>
          <Card.Title
            title={item.title}
            subtitle={getCardSubtitle(item.created_at, item.updated_at)}
          />
          <Card.Content>
            <Text numberOfLines={1}>{item.content}</Text>
          </Card.Content>
        </Card>
      )}
    />

  )

  async function getJournalEntries() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const {data, error, status} = await supabase
        .from("entries")
        .select("title, content, created_at, updated_at")
        .eq("user_id", session?.user.id)
      if (error && status !== 406) {
        throw error
      }
      if (data) {
        console.log("data", data)
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

  function getCardSubtitle(created_at?:string, updated_at?: string): string | undefined{
    return updated_at ? `Updated: ${new Date(updated_at).toLocaleDateString(Intl.DateTimeFormat().resolvedOptions().locale, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })}` : created_at ? `Created: ${new Date(created_at).toLocaleDateString(Intl.DateTimeFormat().resolvedOptions().locale, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })} ` : undefined
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacings["3x"]
  }
})