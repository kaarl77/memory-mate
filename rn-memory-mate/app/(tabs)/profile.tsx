import {StyleSheet, View} from "react-native";
import {Button, Text, useTheme} from "react-native-paper";
import Spacer from "@/components/Spacer";
import {Spacings} from "@/constants/Spacings";
import {useRouter, useNavigation} from "expo-router";
import {supabase} from "@/helpers/supabase";

export default function profile(){
  const theme = useTheme()

  const navigation = useRouter()
  const containerStyle = {
    ...styles.container,
    backgroundColor: theme.colors.background
  }

  return (
    <View style={containerStyle}>
      <Spacer height={Spacings["3x"]}/>
      <Text variant={'headlineSmall'}>Hello, </Text>
      <Spacer height={Spacings["3x"]}/>
      <Button mode={'contained'} textColor={theme.colors.onError}  buttonColor={theme.colors.error} onPress={signOut}>
        Sign out
      </Button>
    </View>
  )

  function signOut(){
    supabase.auth.signOut().then(() => {
      navigation.dismissTo('/login')
    })
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingHorizontal: Spacings["3x"]
  }
})