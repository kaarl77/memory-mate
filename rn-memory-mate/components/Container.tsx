import {View, StyleSheet, SafeAreaView, ScrollView, ViewStyle, FlatList} from 'react-native';
import {useTheme} from "react-native-paper";

type ContainerProps = Readonly<{
  children: React.ReactNode,
  style?: ViewStyle
}>;

const Container = (props: ContainerProps) => {
  const theme = useTheme()

  return (
    <View style={{}}>
      <ScrollView keyboardShouldPersistTaps={'always'} automaticallyAdjustKeyboardInsets={true}>
          <View
            style={{
              ...styles.container,
              ...props.style,
            }}
          >
            {props.children}
          </View>
      </ScrollView>
    </View>)
};

const styles = StyleSheet.create({
  container: {
    // flexDirection: 'column',
    // height: '100%',
    // paddingTop: 30,
    // paddingRight: 15,
    // paddingBottom: 40,
    // paddingLeft: 15,
  },
  scrollWrapper: {
    // minHeight: '100%',
    // flex:1
  }
});

export default Container;