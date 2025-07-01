import {View, StyleSheet} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Image} from "expo-image";
import {Spacings} from "@/constants/Spacings";
import {Button, Text, useTheme} from "react-native-paper";
import {useRouter} from "expo-router";
import Spacer from "@/components/Spacer";
import Container from "@/components/Container";
import {StatusBar} from "expo-status-bar";

export default function index() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Container style={styles.container}>
      <Spacer height={150}/>
      <Image source={require('../assets/images/login-flat.jpg')} style={styles.flatLogo}/>
      <Spacer height={Spacings["1x"]}/>
      <View style={styles.textContainer}>
        <View style={styles.titleContainer}>
          <Image source={require('../assets/icons/book.svg')} style={styles.bookIcon} tintColor={theme.colors.onSurface}/>
          <Text variant={"titleLarge"}>Memory Mate</Text>
        </View>
        <View>
          <Text variant={'headlineMedium'} style={{fontWeight: 'bold'}}>Your Memories, Always Within Reach</Text>
          <Text variant={'labelMedium'} style={{color: theme.colors.tertiary}}>Stay connected to your most important
            moments with MemoryMate. Your AI-powered companion for journaling daily activities, tracking memories, and
            receiving gentle reminders about what matters most. Start making every day memorable</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button mode={'contained'} onPress={() => {
          router.navigate('./login')
        }}>
          Login
        </Button>
        <Button mode={'outlined'} onPress={() => {
          router.navigate('./register')
        }}>
          Register
        </Button>
      </View>
      <StatusBar networkActivityIndicatorVisible={false} style={'auto'}/>

    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: Spacings["3x"]
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: Spacings["2x"]
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacings["1x"]
  },
  bookIcon: {
    width: Spacings["4x"],
    height: Spacings["4x"]
  },
  flatLogo: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: Spacings["2x"]
  },
  buttonContainer: {
    gap: Spacings["2x"]
  }
})