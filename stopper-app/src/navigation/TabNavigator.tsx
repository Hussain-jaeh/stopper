import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { House, TrendingUp, Users, User } from 'lucide-react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PlanScreen } from '../screens/PlanScreen';
import { PanicScreen } from '../screens/PanicScreen';
import { SosButton } from '../components/panic/SosButton';
import { colors } from '../constants/colors';
import { type } from '../constants/typography';

export type RootStackParamList = {
  Tabs: undefined;
  Panic: undefined;
};

export type TabParamList = {
  Home: { onStartOnboarding: () => void };
  Progress: undefined;
  Community: undefined;
  ProfileTab: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Plan: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Plan" component={PlanScreen} />
    </ProfileStack.Navigator>
  );
}

const TAB_H = 60;

type Props = { onStartOnboarding: () => void };

export function TabNavigator({ onStartOnboarding }: Props) {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs">
        {() => <TabsWithSos onStartOnboarding={onStartOnboarding} />}
      </RootStack.Screen>
      <RootStack.Screen
        name="Panic"
        component={PanicScreen}
        options={{ presentation: 'fullScreenModal', animation: 'fade' }}
      />
    </RootStack.Navigator>
  );
}

function TabsWithSos({ onStartOnboarding }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<import('@react-navigation/native-stack').NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={{ flex: 1 }}>
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
          tabBarLabelStyle: { ...type.label, fontSize: 11 },
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
          name="ProfileTab"
          component={ProfileStackNavigator}
          options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }}
        />
      </Tab.Navigator>
      <SosButton onPress={() => navigation.navigate('Panic')} />
    </View>
  );
}
