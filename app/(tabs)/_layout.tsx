import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import DarkGradientBackground from '../../components/DarkGradientBackground';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { isDarkMode, colors } = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('TabsLayout: Auth state - user:', user, 'loading:', loading);
    if (!loading && !user) {
      console.log('TabsLayout: User not authenticated, redirecting to login');
      // Redirect to login if user is not authenticated
      router.replace('/(auth)/login');
    } else if (!loading && user) {
      console.log('TabsLayout: User authenticated, allowing access to tabs');
    }
  }, [user, loading, router]);

  // Don't render tabs if user is not authenticated
  if (loading || !user) {
    return null;
  }

  return (
    <DarkGradientBackground>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
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
