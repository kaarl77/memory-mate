import React from 'react';
import {Tabs} from 'expo-router';
import {useClientOnlyValue} from '@/components/useClientOnlyValue';
import {useTheme} from "react-native-paper";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {

  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        animation: "shift",
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShown: useClientOnlyValue(false, true),
        headerTintColor: theme.colors.primary,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({color}) => <Ionicons name={"home"} color={color} size={24}/>,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({color}) => <Ionicons name={"journal"} color={color} size={24}/>,
        }}
      />
      <Tabs.Screen
        name={"reminders"}
        options={{
          title: 'Reminders',
          tabBarIcon: ({color}) => <Ionicons name={"calendar"} color={color} size={24}/>,
        }}
      />
      <Tabs.Screen
        name={"profile"}
        options={{
          title: 'Profile',
          tabBarIcon: ({color}) => <Ionicons name={"person"} color={color} size={24}/>,
        }}
      />
    </Tabs>
  );
}
