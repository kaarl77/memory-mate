import {Alert, FlatList, StyleSheet, View, ActivityIndicator, ScrollView} from "react-native";
import {Card, FAB, Text, useTheme} from "react-native-paper";
import {useEffect, useState} from "react";
import {Session} from "@supabase/auth-js";
import {Reminder, supabase, getUserReminders, deleteUserReminder} from "@/helpers/supabase";
import {Spacings} from "@/constants/Spacings";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useRouter} from "expo-router";
import {useIsFocused} from "@react-navigation/core";
import Spacer from "@/components/Spacer";
import {Platform} from "react-native";
import {
  requestRemindersPermissions,
  getMemoryMateCalendar,
  createMemoryMateCalendar,
  syncRemindersFromOS,
  formatReminderDueDate
} from "@/helpers/reminders-helpers";
import {useReminders} from "@/helpers/use-reminders";
import {SafeAreaView} from "react-native-safe-area-context";
import Container from "@/components/Container";

export default function index() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [reminders, setReminders] = useState<Reminder[] | null>(null);
  const router = useRouter();
  const isFocused = useIsFocused();

  const theme = useTheme();
  const {} = useReminders()

  const onRefresh = async () => {
    setRefreshing(true);

    // Sync with OS index if on iOS
    if (Platform.OS === 'ios' && session?.user.id) {
      await syncRemindersFromOS(session.user.id);
    }

    // Get index from database
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

  useEffect(() => {
    if (session && isFocused) {
      getReminders();

      // When the screen is focused, try to sync with OS index
      if (Platform.OS === 'ios' && session.user.id) {
        syncRemindersFromOS(session.user.id);
      }
    }
  }, [session, isFocused]);


  return (
    <Container >
      <Text variant={"headlineLarge"}>Header</Text>
      <Card>
        <Card.Title title={"Title"}></Card.Title>
        <Card.Content>
          <Text>This is a test</Text>
        </Card.Content>
      </Card><Card>
      <Card.Title title={"Title"}></Card.Title>
      <Card.Content>
        <Text>This is a test</Text>
      </Card.Content>
    </Card><Card>
      <Card.Title title={"Title"}></Card.Title>
      <Card.Content>
        <Text>This is a test</Text>
      </Card.Content>
    </Card><Card>
      <Card.Title title={"Title"}></Card.Title>
      <Card.Content>
        <Text>This is a test</Text>
      </Card.Content>
    </Card><Card>
      <Card.Title title={"Title"}></Card.Title>
      <Card.Content>
        <Text>This is a test</Text>
      </Card.Content>
    </Card><Card>
      <Card.Title title={"Title"}></Card.Title>
      <Card.Content>
        <Text>This is a test</Text>
      </Card.Content>
    </Card><Card>
      <Card.Title title={"Title"}></Card.Title>
      <Card.Content>
        <Text>This is a test</Text>
      </Card.Content>
    </Card><Card>
      <Card.Title title={"Title"}></Card.Title>
      <Card.Content>
        <Text>This is a test</Text>
      </Card.Content>
    </Card><Card>
      <Card.Title title={"Title"}></Card.Title>
      <Card.Content>
        <Text>This is a test</Text>
      </Card.Content>
    </Card><Card>
      <Card.Title title={"Title"}></Card.Title>
      <Card.Content>
        <Text>This is a test</Text>
      </Card.Content>
    </Card><Card>
      <Card.Title title={"Title"}></Card.Title>
      <Card.Content>
        <Text>This is a test</Text>
      </Card.Content>
    </Card><Card>
      <Card.Title title={"Title"}></Card.Title>
      <Card.Content>
        <Text>This is a test</Text>
      </Card.Content>
    </Card>
    </Container>

  )

  return (
    <View style={[styles.container]}>
      <Spacer height={Spacings["3x"]}/>
      {loading && !refreshing ? (
        <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={theme.colors.primary}/>
          <Spacer height={Spacings["2x"]}/>
          <Text>Loading reminders...</Text>
        </SafeAreaView>
      ) : (
        <FlatList
          contentContainerStyle={{gap: Spacings["1x"], flexGrow: 1}}
          data={reminders}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={() => (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50}}>
              <Text>No reminders found</Text>
              <Spacer height={Spacings["2x"]}/>
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
                subtitle={formatReminderDueDate(item.due_date)}
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
                      handleDeleteReminder(item.id, session.user.id);
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

      const data = await getUserReminders(session.user.id);
      setReminders(data);
    } catch (error) {
      console.log("error", error);
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteReminder(reminderId: string, userId: string) {
    const success = await deleteUserReminder(reminderId, userId);
    if (success) {
      getReminders();
    }
  }

  function createNewReminder() {
    // Navigate to the edit reminder screen to create a new reminder
    router.push('/editReminder');
  }

  function openReminder(reminder: Reminder) {
    // Navigate to the edit reminder screen with the selected reminder
    router.push({
      pathname: '/editReminder',
      params: {reminder: JSON.stringify(reminder)}
    });
  }
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