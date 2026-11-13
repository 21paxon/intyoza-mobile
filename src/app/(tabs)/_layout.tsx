import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

const tabIcon = (name: React.ComponentProps<typeof Ionicons>['name']) => {
  const Icon = Object.assign(
    (props: { color: unknown; size: number }): React.ReactElement => <Ionicons name={name} size={props.size} color={props.color as string | undefined} />,
    { displayName: `IntyozaTabIcon(${name})` },
  );
  return Icon;
};

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.forest, tabBarInactiveTintColor: colors.muted, tabBarStyle: { height: 68, paddingTop: 8, paddingBottom: 10, borderTopColor: colors.line, backgroundColor: colors.white }, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' } }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home-outline') }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn', tabBarIcon: tabIcon('book-outline') }} />
      <Tabs.Screen name="care" options={{ title: 'Find care', tabBarIcon: tabIcon('location-outline') }} />
      <Tabs.Screen name="ask" options={{ title: 'Ask', tabBarIcon: tabIcon('chatbubble-ellipses-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person-outline') }} />
      <Tabs.Screen name="myths" options={{ href: null }} />
    </Tabs>
  );
}
