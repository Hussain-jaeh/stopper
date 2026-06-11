import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { House, TrendingUp, Users, User } from 'lucide-react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../constants/colors';
import { type } from '../constants/typography';

export type TabParamList = {
  Home: { onStartOnboarding: () => void };
  Progress: undefined;
  Community: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_H = 60;

type Props = { onStartOnboarding: () => void };

export function TabNavigator({ onStartOnboarding }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface1,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: TAB_H + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.jade400,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tab.Screen
        name="Home"
        options={{ tabBarIcon: ({ color, size }) => <House size={size} color={color} /> }}
      >
        {() => <DashboardScreen onStartOnboarding={onStartOnboarding} />}
      </Tab.Screen>

      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} /> }}
      />

      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{ tabBarIcon: ({ color, size }) => <Users size={size} color={color} /> }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  label: { ...type.label, fontSize: 11 },
});
