import React, {ReactElement, useEffect, useState} from 'react';
import {FlatList, ViewStyle, StyleSheet, View, FlatListProps} from 'react-native';

type ChildrenFlatListProps = Omit<FlatListProps<any>, 'data' | 'renderItem' | 'keyExtractor'> & {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  automaticallyAdjustKeyboardInsets?: boolean;
  footerPadding?: number;
};

/**
 * A FlatList component that accepts children prop like ScrollView
 * This is a drop-in replacement for ScrollView that uses FlatList internally
 */
const ChildrenFlatList = (props: ChildrenFlatListProps) => {
  const {
    children,
    contentContainerStyle,
    style,
    keyboardShouldPersistTaps = 'always',
    automaticallyAdjustKeyboardInsets = true,
    footerPadding = 40,
    ...restProps
  } = props;

  const [childrenArray, setChildrenArray] = useState<ReactElement[]>([]);
  
  // Convert children to array for FlatList
  useEffect(() => {
    const childArray = React.Children.toArray(children);
    setChildrenArray(childArray as ReactElement[]);
  }, [children]);

  // If no children, render empty container
  if (childrenArray.length === 0) {
    return (
      <View style={[styles.container, contentContainerStyle]}>
        {children}
      </View>
    );
  }

  return (
    <FlatList
      data={childrenArray}
      renderItem={({item}) => item}
      keyExtractor={(_, index) => `child-${index}`}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      automaticallyAdjustKeyboardInsets={automaticallyAdjustKeyboardInsets}
      style={[styles.flatList, style]}
      contentContainerStyle={[styles.container, contentContainerStyle]}
      ListFooterComponent={footerPadding > 0 ? <View style={{height: footerPadding}} /> : null}
      {...restProps}
    />
  );
};

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
});

export default ChildrenFlatList;