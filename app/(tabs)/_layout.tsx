import Colors from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import DarkGradientBackground from '../../components/DarkGradientBackground';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { isDarkMode, colors } = useTheme();
  const colorScheme = isDarkMode ? 'dark' : 'light';

  return (
    <DarkGradientBackground>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
          tabBarStyle: {
            backgroundColor: isDarkMode ? '#0a1420' : Colors[colorScheme].background, // Use darker surface color for dark mode
            borderTopColor: isDarkMode ? '#1a2332' : Colors[colorScheme].icon, // Use border color for dark mode
            borderTopWidth: 0.5,
            paddingBottom: 4,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="notes"
          options={{
            title: 'Notes',
            tabBarIcon: ({ color }) => <TabBarIcon name="sticky-note" color={color} />,
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ color }) => <TabBarIcon name="check-square" color={color} />,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          }}
        />
        <Tabs.Screen
          name="notebooks"
          options={{
            title: 'Notebooks',
            tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
          }}
        />
      </Tabs>
    </DarkGradientBackground>
  );
}
