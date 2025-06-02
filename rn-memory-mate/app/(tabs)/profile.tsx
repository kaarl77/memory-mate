import {StyleSheet, View, ActivityIndicator} from "react-native";
import {Button, Text, useTheme, Avatar, Card, Divider} from "react-native-paper";
import Spacer from "@/components/Spacer";
import {Spacings} from "@/constants/Spacings";
import {useRouter} from "expo-router";
import {supabase} from "@/helpers/supabase";
import {useEffect, useState} from "react";
import {useIsFocused} from "@react-navigation/core";

export default function Profile() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const containerStyle = {
    ...styles.container,
    backgroundColor: theme.colors.background
  };

  const isFocused = useIsFocused()

  useEffect(() => {
    // Fetch the current user and profile data
    async function fetchUserProfile() {
      try {
        setLoading(true);

        // Get the current user
        const {data: {user}} = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);

          // Get the user's profile information
          const {data, error} = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else if (data) {
            setUsername(data.username);
            setFullName(data.full_name);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [isFocused]);

  function signOut() {
    supabase.auth.signOut().then(() => {
      router.replace('/login');
    });
  }

  function navigateToEditProfile() {
    router.push('/editProfile');
  }

  if (loading) {
    return (
      <View style={[containerStyle, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary}/>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Spacer height={Spacings["3x"]}/>

      <View style={styles.profileHeader}>
        <Text variant="headlineSmall">Hello, {username || fullName || 'User'}</Text>
      </View>

      <Spacer height={Spacings["3x"]}/>

      <Button
        mode="contained"
        icon="account-edit"
        onPress={navigateToEditProfile}
      >
        Edit Profile
      </Button>

      <Spacer height={Spacings["2x"]}/>

      <Divider/>

      <Spacer height={Spacings["2x"]}/>

      <Button
        mode="contained"
        textColor={theme.colors.onError}
        buttonColor={theme.colors.error}
        icon="logout"
        onPress={signOut}
      >
        Sign out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacings["3x"],
    paddingVertical: Spacings["2x"]
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileCard: {
    marginBottom: Spacings["2x"]
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
});