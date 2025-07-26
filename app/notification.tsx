import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenBackground from '../components/ScreenBackground';
import { useTheme } from '../contexts/ThemeContext';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  details?: string;
  date?: string; // Added date for grouping
}

// Helper to group notifications by date
function groupNotifications(notifications: Notification[]) {
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const sections: { title: string; data: Notification[]; key: string }[] = [];
  const todayNotes = notifications.filter(n => n.date === today);
  const yesterdayNotes = notifications.filter(n => n.date === yesterday);
  const earlierNotes = notifications.filter(n => n.date !== today && n.date !== yesterday);
  if (todayNotes.length) sections.push({ title: 'Today', data: todayNotes, key: 'today' });
  if (yesterdayNotes.length) sections.push({ title: 'Yesterday', data: yesterdayNotes, key: 'yesterday' });
  if (earlierNotes.length) sections.push({ title: 'Earlier', data: earlierNotes, key: 'earlier' });
  return sections;
}

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showMarkAll, setShowMarkAll] = useState(false);
  const timerRef = useRef<any>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Replace with API call
    const fetchNotifications = async () => {
      try {
        const now = dayjs();
        const data: Notification[] = [
          { id: '1', message: 'Your note was synced successfully.', read: false, details: 'Your note "Meeting Notes" was synced to the cloud.', date: now.format('YYYY-MM-DD') },
          { id: '2', message: 'Reminder: Task due tomorrow.', read: false, details: 'Don’t forget to complete your task: "Submit report".', date: now.format('YYYY-MM-DD') },
          { id: '3', message: 'Welcome to Pallenote!', read: true, details: 'Explore all the features and get productive.', date: now.format('YYYY-MM-DD') },
          { id: '4', message: 'Notebook shared with you.', read: false, details: 'A new notebook was shared with you by John.', date: now.subtract(1, 'day').format('YYYY-MM-DD') },
          { id: '5', message: 'Task completed!', read: true, details: 'You completed the task: "Read Chapter 5".', date: now.subtract(1, 'day').format('YYYY-MM-DD') },
          { id: '6', message: 'Backup successful.', read: true, details: 'Your notes were backed up to the cloud.', date: now.subtract(2, 'day').format('YYYY-MM-DD') },
          { id: '7', message: 'New feature: Dark mode', read: true, details: 'Try out the new dark mode in settings.', date: now.subtract(3, 'day').format('YYYY-MM-DD') },
          { id: '8', message: 'Weekly summary available.', read: false, details: 'Check your productivity stats for this week.', date: now.subtract(3, 'day').format('YYYY-MM-DD') },
          { id: '9', message: 'Task overdue!', read: false, details: 'The task "Finish project" is overdue.', date: now.subtract(4, 'day').format('YYYY-MM-DD') },
          { id: '10', message: 'Note deleted.', read: true, details: 'You deleted a note: "Old Ideas".', date: now.subtract(5, 'day').format('YYYY-MM-DD') },
          { id: '11', message: 'App update available.', read: false, details: 'A new version of the app is available.', date: now.subtract(6, 'day').format('YYYY-MM-DD') },
          { id: '12', message: 'Welcome back!', read: true, details: 'Glad to see you again.', date: now.subtract(7, 'day').format('YYYY-MM-DD') },
          { id: '13', message: 'Tip: Use tags', read: true, details: 'Organize your notes with tags for easy search.', date: now.subtract(8, 'day').format('YYYY-MM-DD') },
        ];
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Show 'Mark all as read' after 3s when a notification is opened
  useEffect(() => {
    if (expanded) {
      setShowMarkAll(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowMarkAll(true), 3000);
    } else {
      setShowMarkAll(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [expanded]);

  // Hide 'Mark all as read' if all notifications are read
  useEffect(() => {
    if (notifications.every(n => n.read)) setShowMarkAll(false);
  }, [notifications]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setExpanded(null);
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Mark notification as read when expanded
  const handleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Collapsible state for sections
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({ today: false, yesterday: true, earlier: true });
  const sections = groupNotifications(notifications);
  const handleToggleSection = (key: string) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  if (loading) return (
    <ScreenBackground>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    </ScreenBackground>
  );

  return (
    <ScreenBackground>
      {/* Header with blur overlay */}
      <View style={{ position: 'relative', zIndex: 2 }}>
        <BlurView intensity={30} tint={colors.background === '#101a2b' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[styles.header, { backgroundColor: colors.surface + 'cc' }]}> 
          <TouchableOpacity onPress={() => router.back()} style={[styles.addButton, { backgroundColor: colors.primary, marginRight: 12 }]}> 
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ fontSize: 26, marginRight: 8 }}>🔔</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}> 
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{unreadCount}</Text>
            </View>
          )}
          {showMarkAll && unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={[styles.markAllBtn, { backgroundColor: colors.primary, marginLeft: 8 }]}> 
              <Ionicons name="checkmark-done" size={18} color="#fff" />
              <Text style={{ color: '#fff', marginLeft: 6, fontWeight: '600', fontSize: 13 }}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 1, backgroundColor: colors.border + '55', marginTop: 2, marginBottom: 2, width: '100%' }} />
      </View>
      {/* Subtitle below header */}
      <Text style={{ color: colors.textSecondary, fontSize: 15, marginTop: 8, marginLeft: 24, fontWeight: '500', marginBottom: 8 }}>
        Stay up to date with your notes, tasks, and reminders.
      </Text>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 18, paddingTop: 10, paddingBottom: insets.bottom + 40 }}
        renderSectionHeader={({ section }) => (
          <TouchableOpacity onPress={() => handleToggleSection(section.key)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 4 }}>
            <Ionicons name={collapsed[section.key] ? 'chevron-forward' : 'chevron-down'} size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>{section.title}</Text>
            <Text style={{ color: colors.textSecondary, marginLeft: 8, fontWeight: '500', fontSize: 13 }}>{section.data.length} notifications</Text>
          </TouchableOpacity>
        )}
        renderItem={({ item, section }) =>
          collapsed[section.key] ? null : (
            <Animated.View
              style={[
                styles.card,
                { backgroundColor: colors.card, shadowColor: colors.text, opacity: item.read ? 0.7 : 1 },
                { flexDirection: 'row', alignItems: 'center', marginBottom: 0 },
              ]}
            >
              {/* Gradient accent bar */}
              <View style={{ width: 5, height: '90%', borderRadius: 4, marginRight: 14, backgroundColor: item.read ? colors.textSecondary + '33' : colors.primary }} />
              <TouchableOpacity
                onPress={() => handleExpand(item.id)}
                activeOpacity={0.85}
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingVertical: 6 }}
              >
                <Ionicons name={item.read ? 'notifications-outline' : 'notifications'} size={22} color={item.read ? colors.textSecondary : colors.primary} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: item.read ? '400' : '700', fontSize: 16, letterSpacing: 0.1 }}>{item.message}</Text>
                  {expanded === item.id && item.details && (
                    <Text style={{ color: colors.textSecondary, marginTop: 6, fontSize: 13, fontWeight: '500', lineHeight: 18 }}>{item.details}</Text>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </Animated.View>
          )
        }
        SectionSeparatorComponent={() => <View style={{ height: 2 }} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40, flex: 1, justifyContent: 'center' }}>
            <Ionicons name="notifications-outline" size={90} color={colors.primary} style={{ opacity: 0.18, marginBottom: 10 }} />
            <Text style={{ fontSize: 48, marginBottom: 10 }}>📭</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>No notifications yet</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', maxWidth: 260 }}>
              You're all caught up! New notifications will appear here as you use the app.
            </Text>
            <Text style={{ color: colors.primary, fontSize: 15, marginTop: 18, fontWeight: '500' }}>
              Tip: Enable reminders to never miss a task.
            </Text>
          </View>
        }
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButton: {
    borderRadius: 24,
    padding: 8,
    marginLeft: 8,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  badge: {
    marginLeft: 8,
    minWidth: 22,
    height: 22,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBtn: {
    marginLeft: 12,
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
});

export default NotificationsScreen;
