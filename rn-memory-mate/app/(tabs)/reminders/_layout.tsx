import {Stack} from "expo-router/stack";
import {useTheme} from "react-native-paper";

export default function TabLayout() {
  const theme = useTheme()

  return (
    <Stack screenOptions={{}}>
      <Stack.Screen name={'index'} options={{
        headerShown: true,
        headerLargeTitle:true,
        headerStyle:{
          backgroundColor:"yellow"
        }

        // headerLargeTitle: true,
        // animationMatchesGesture:true
      }}
      />
    </Stack>
  )
}