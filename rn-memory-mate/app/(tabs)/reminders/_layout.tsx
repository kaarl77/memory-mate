import {Stack} from "expo-router/stack";
import GestureHandlerRootView from "expo-dev-menu/mocks/react-native-gesture-handler/src";

export default function TabLayout() {
  return (
    <GestureHandlerRootView>
      <Stack>
        <Stack.Screen name={'index'} options={{
          headerShown: true,
          headerLargeTitle: true,
          headerBlurEffect: "systemChromeMaterial",
          headerTransparent: true,
          headerTitle: "Reminders",
        }}
        />
      </Stack>
    </GestureHandlerRootView>
  )
}