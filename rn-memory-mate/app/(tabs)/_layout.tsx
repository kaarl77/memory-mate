import React from 'react';
import {withLayoutContext} from 'expo-router';
import {
  createNativeBottomTabNavigator,
  NativeBottomTabNavigationOptions,
  NativeBottomTabNavigationEventMap,
} from '@bottom-tabs/react-navigation';
import {ParamListBase, TabNavigationState} from '@react-navigation/native';

const BottomTabNavigator = createNativeBottomTabNavigator().Navigator;

const Tabs = withLayoutContext<
  NativeBottomTabNavigationOptions,
  typeof BottomTabNavigator,
  TabNavigationState<ParamListBase>,
  NativeBottomTabNavigationEventMap
>(BottomTabNavigator);

export default function TabLayout() {
  return (
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({}) => require('../../assets/icons/home-outline.svg'),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            tabBarIcon: ({}) => require('../../assets/icons/journal-outline.svg'),
          }}
        />
        <Tabs.Screen
          name={"reminders"}
          options={{
            title: 'Reminders',
            tabBarIcon: ({}) => require('../../assets/icons/calendar-outline.svg'),
          }}
        />
        <Tabs.Screen
          name={"profile"}
          options={{
            title: 'Profile',
            tabBarIcon: ({}) => require('../../assets/icons/person-outline.svg'),
          }}
        />
      </Tabs>
  );
}
