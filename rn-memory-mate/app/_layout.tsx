import FontAwesome from '@expo/vector-icons/FontAwesome';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import 'react-native-reanimated';


import {useColorScheme} from '@/components/useColorScheme';
import {MD3DarkTheme, MD3LightTheme, PaperProvider, useTheme} from "react-native-paper";
import {defaultDarkTheme, defaultLightTheme} from "@/constants/Colors";
import {Platform, StyleProp, ViewStyle} from "react-native";
import {StatusBar} from "expo-status-bar";
import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import GestureHandlerRootView from "expo-dev-menu/mocks/react-native-gesture-handler/src";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const colorScheme = useColorScheme();

  const paperTheme =
    colorScheme === 'dark'
      ? {...MD3DarkTheme, colors: defaultDarkTheme.colors}
      : {...MD3LightTheme, colors: defaultLightTheme.colors};

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }


  return (
    // <PaperProvider theme={paperTheme}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {Platform.OS === "ios" ? (
          <StatusBar style="auto" translucent={false} animated={true}/>
        ) : (
          <StatusBar style="auto" backgroundColor={paperTheme.colors.background} translucent={false}/>
        )}
        <RootLayoutNav/>
      </ThemeProvider>
    // </PaperProvider>
  )
}

function RootLayoutNav() {
  const theme = useTheme()

  const headerStyle: StyleProp<{ backgroundColor?: string | undefined }> = {
    backgroundColor: theme.colors.background
  }

  return (
    // <GestureHandlerRootView>
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false}}/>
      <Stack.Screen name="login" options={{
        headerBackTitle: "Back",
        headerTitle: "Login",
        headerStyle,
        headerTintColor: theme.colors.primary,
      }}/>
      <Stack.Screen name="register" options={{
        headerBackTitle: "Back",
        headerTitle: "Register",
        headerStyle,
        headerTintColor: theme.colors.primary
      }}/>
      <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
      <Stack.Screen name="chat" options={{
        presentation: 'modal',
        headerTitle: "Assistant chat",
        headerTintColor: theme.colors.primary,
        headerStyle
      }}/>
      <Stack.Screen name={"editJournalEntry"} options={{
        headerTitle: "Edit Journal Entry",
        headerTintColor: theme.colors.primary,
        headerStyle,
        headerBackTitle: "Back"
      }}/>
      <Stack.Screen name={'editReminder'} options={{
        headerTitle: "Edit Reminder",
        headerTintColor: theme.colors.primary,
        headerStyle,
        headerBackTitle: "Back"
      }}/>
      <Stack.Screen name={"editProfile"} options={{
        headerTitle: "Edit Profile",
        headerTintColor: theme.colors.primary,
        headerStyle,
        headerBackTitle: "Back"
      }}/>
    </Stack>
    // {/*</GestureHandlerRootView>*/}
  );
}
