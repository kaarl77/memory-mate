import FontAwesome from '@expo/vector-icons/FontAwesome';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import 'react-native-reanimated';


import {useColorScheme} from '@/components/useColorScheme';
import {MD3DarkTheme, MD3LightTheme, PaperProvider} from "react-native-paper";
import {defaultDarkTheme, defaultLightTheme} from "@/constants/Colors";

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
    <PaperProvider theme={paperTheme}>
      <RootLayoutNav/>
    </PaperProvider>
  )
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerShown: false}}/>
      <Stack.Screen name="login" options={{headerBackTitle:"Back"}}/>
      <Stack.Screen name="register"/>
      <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
      <Stack.Screen name="modal" options={{presentation: 'modal'}}/>
    </Stack>
  );
}
