import {SafeAreaView} from "react-native-safe-area-context";
import {Alert, StyleSheet, View} from "react-native";
import {useEffect, useState} from "react";
import {supabase} from "@/helpers/supabase";
import {Image} from "expo-image";
import Spacer from "@/components/Spacer";
import {Spacings} from "@/constants/Spacings";
import {Button, TextInput, useTheme} from "react-native-paper";
import {Session} from "@supabase/auth-js";
import {useRouter} from "expo-router";

//kaarlmoroti@gmail.com
export default function register() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const theme = useTheme()

  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Image source={require('../assets/icons/book.svg')} style={styles.icon} tintColor={theme.colors.onBackground}/>

      <Spacer height={Spacings["3x"]}/>
      <TextInput label="Username" mode={'outlined'} value={username} onChangeText={setUsername}
                 placeholder={"your_cool_name"} autoCapitalize={'none'}/>

      <Spacer height={Spacings["3x"]}/>
      <TextInput label="Email" mode={'outlined'} value={email} onChangeText={setEmail}
                 placeholder={"some@example.com"} autoCapitalize={'none'}/>

      <Spacer height={Spacings["2x"]}/>
      <TextInput label="Password" mode={'outlined'} secureTextEntry={true} value={password} onChangeText={setPassword}
                 autoCapitalize={'none'}/>

      <View style={styles.buttonContainer}>
        <Button
          mode={'contained'}
          onPress={() => {
            signUpWithEmail().then(() => {
              supabase.auth.getSession().then(({data: {session}}) => {
                setSession(session)
              })

              supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session)
              })

              updateProfile({username: username}).then(() => {
                router.navigate('./(tabs)')
              })
            })
          }}
          loading={loading}
        >
          Register
        </Button>
      </View>
    </SafeAreaView>
  )

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: {session},
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }


  async function updateProfile({username}: {
    username: string
  }) {
    try {
      setLoading(true)
      console.log("starting update")
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        updated_at: new Date(),
      }

      const {error} = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const {data, error, status} = await supabase
        .from('profiles')
        .select(`username`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

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
    // flex: 1,
    // justifyContent: 'flex-end',
  }
})