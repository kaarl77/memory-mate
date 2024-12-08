import {View, StyleSheet} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Image} from "expo-image";
import {Spacings} from "@/constants/Spacings";
import {Button, Text, useTheme} from "react-native-paper";
import {useRouter} from "expo-router";

export default function index() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../assets/images/login-flat.jpg')} style={styles.flatLogo}/>
      <View style={styles.textContainer}>
        <View style={styles.titleContainer}>
          <Image source={require('../assets/icons/book.svg')} style={styles.bookIcon}/>
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
          console.log("register")
        }}>
          Register
        </Button>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    aspectRatio: 1
  },
  buttonContainer: {
    gap: Spacings["2x"]
  }
})