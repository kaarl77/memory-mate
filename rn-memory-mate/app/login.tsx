import {SafeAreaView} from "react-native-safe-area-context";
import {Alert, KeyboardAvoidingView, StyleSheet, View} from "react-native";
import {Button, TextInput, useTheme} from "react-native-paper";
import {Spacings} from "@/constants/Spacings";
import {Image} from "expo-image";
import Spacer from "@/components/Spacer";
import {useState} from "react";
import {supabase} from "@/helpers/supabase";
import {useRouter} from "expo-router";

export default function login() {
  const theme = useTheme();
  const router = useRouter()

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  async function signInWithEmail(forceEmail?: string, forcePassword?: string) {
    setLoading(true)
    const {error} = await supabase.auth.signInWithPassword({
      email: forceEmail?? email,
      password: forcePassword?? password,
    })

    if (error) {
      Alert.alert(error.message)
    } else {
      router.navigate('./(tabs)')
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Image source={require('../assets/icons/book.svg')} style={styles.icon} tintColor={theme.colors.onBackground}/>

      <Spacer height={Spacings["3x"]}/>
      <TextInput label="Email" mode={'outlined'} value={email} onChangeText={setEmail} placeholder={"some@example.com"} autoCapitalize={'none'}/>

      <Spacer height={Spacings["2x"]}/>
      <TextInput label="Password" mode={'outlined'} secureTextEntry={true} value={password} onChangeText={setPassword}/>

      <View style={styles.buttonContainer}>
        <Button
          mode={'contained'}
          onPress={() => {
            signInWithEmail()
          }}
          onLongPress={() => {
            signInWithEmail('kaarlmoroti@gmail.com', 'testtest')
          }}
          loading={loading}
        >
          Login
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacings["3x"],
    flex: 1,
  },
  icon: {
    width: Spacings["8x"],
    height: Spacings["8x"],
    alignSelf: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  }
})