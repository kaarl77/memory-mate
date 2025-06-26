import {ScrollView, StyleSheet, View, ViewStyle} from 'react-native';

import {Card, FAB, Text, useTheme} from "react-native-paper";
import {useRouter} from "expo-router";
import {Spacings} from "@/constants/Spacings";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useEffect, useState} from "react";
import {getUpcomingReminders, getYesterdaysLatestEntry, JournalEntry, Reminder, supabase} from "@/helpers/supabase";
import Spacer from "@/components/Spacer";
import {getCardSubtitle} from "@/app/(tabs)/journal";
import {useIsFocused} from "@react-navigation/core";
import {SafeAreaView} from "react-native-safe-area-context";

export default function TabOneScreen() {
  const router = useRouter()
  const theme = useTheme()
  const isFocused = useIsFocused()

  const [yesterdaysLatestEntry, setYesterdaysLatestEntry] = useState<JournalEntry | null>(null)
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      if (session?.user && isFocused) {
        getYesterdaysLatestEntry(session.user.id).then((entry) => {
          if (entry.data?.[0]) {
            setYesterdaysLatestEntry(entry.data[0])
          }
        })
        getUpcomingReminders(session.user.id).then((reminders) => {
          setUpcomingReminders(reminders.data || [])
        })
      }
    })
  }, [isFocused])

  const separatorStyle: ViewStyle = {
    height: 1,
    width: '100%',
    backgroundColor: theme.colors.backdrop,
  }

  return (
    <View style={{backgroundColor: theme.colors.background}}>
      <ScrollView style={styles.container} automaticallyAdjustKeyboardInsets={true}>
        <SafeAreaView>
          <View style={{
            flexDirection:"column",
            height:"100%"
          }}>
        <Spacer height={Spacings["3x"]}/>
        <Text variant={"headlineSmall"}>Latest highlight</Text>
        <Text variant={"titleLarge"} style={{color: theme.colors.outline}}>Check your latest journal entry</Text>
        <Spacer height={Spacings["3x"]}/>

        <Card mode={"contained"}>
          <Card.Title
            title={yesterdaysLatestEntry?.title}
            subtitle={getCardSubtitle(yesterdaysLatestEntry?.created_at, yesterdaysLatestEntry?.updated_at)}
          />
          <Card.Content>
            <Text>{yesterdaysLatestEntry?.content}</Text>
          </Card.Content>
        </Card>
        <Spacer height={Spacings["3x"]}/>

        <View style={separatorStyle}/>
        <Spacer height={Spacings["3x"]}/>
        <Text variant={"headlineSmall"}>Upcoming reminders</Text>
        <Text variant={"titleLarge"} style={{color: theme.colors.outline}}>Check what is planned next</Text>

        <Spacer height={Spacings["3x"]}/>

        {upcomingReminders.map((reminder, index) => (
          <Card key={index} style={{marginHorizontal: 2}}>
            <Card.Title
              title={reminder.title}
              subtitle={reminder.description}
            />
            <Card.Content>
              <Text>Due: {new Date(reminder.due_date ?? '').toLocaleDateString(Intl.DateTimeFormat().resolvedOptions().locale, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}</Text>
            </Card.Content>
          </Card>
        ))}
          </View>
        </SafeAreaView>

      </ScrollView>
      <FAB
        icon={() => <Ionicons name={"chatbubbles-outline"} size={Spacings["3x"]} color={theme.colors.primary}/>}
        onPress={() => {
          router.navigate("/chat")
        }}
        style={styles.fab}
        variant={'primary'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    minHeight:"100%",
    paddingHorizontal: Spacings["3x"],
    paddingBottom: Spacings["3x"],
  },
  fab: {
    position: 'absolute',
    margin: Spacings["3x"],
    right: 0,
    bottom: 80,
  }
});
