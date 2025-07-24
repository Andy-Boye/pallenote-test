import { getNotes } from "@/api/notesApi";
import type { Note } from "@/api/types";
import FloatingActionButton from '@/components/FloatingActionButton';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import { Alert, Animated, Dimensions, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DarkGradientBackground from '../../components/DarkGradientBackground';

const HomeScreen = () => {
  const { colors } = useTheme()
  const [searchText, setSearchText] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerAnim] = useState(new Animated.Value(-Dimensions.get('window').width * 0.5))
  const drawerWidth = Dimensions.get('window').width * 0.5
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes();
        setNotes(data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const recentNotes = notes.slice(0, 3);
  const quickStats = [
    { label: "Notes", count: notes.length, icon: "document-text-outline", color: "#3B82F6" },
    { label: "Tasks", count: 8, icon: "checkbox-outline", color: "#10B981" },
    { label: "Recordings", count: 5, icon: "mic-outline", color: "#F59E0B" },
  ]

  const settingsOptions = [
    { label: "Account Info", path: "/settings/account-info", icon: "person-outline" },
    { label: "Payment Plan", path: "/settings/payment-plan", icon: "card-outline" },
    { label: "Language", path: "/settings/language", icon: "language-outline" },
    { label: "Privacy Policy", path: "/settings/privacy-policy", icon: "lock-closed-outline" },
    { label: "Community", path: "/settings/community", icon: "people-outline" },
    { label: "FAQ", path: "/settings/faq", icon: "help-circle-outline" },
    { label: "About Us", path: "/settings/about-us", icon: "information-circle-outline" },
  ]

  const handleSearch = () => Alert.alert("Search", `Searching for: ${searchText}`)
  const handleNotifications = () => router.push('/notification')
  const handleLogout = () => {
    // TODO: Implement actual logout logic
    alert('Logged out!');
    closeDrawer();
    router.replace('/(auth)/login');
  };

  const openDrawer = () => {
    setDrawerOpen(true)
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: -drawerWidth,
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: false,
    }).start(() => setDrawerOpen(false))
  }

  return (
    <DarkGradientBackground>
      <StatusBar hidden />
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={openDrawer}>
              <Ionicons name="menu" size={28} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNotifications}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.greeting, { color: colors.text }]} className="font-[InterBold]">
            Good morning, John!
          </Text>

          <View style={[styles.searchContainer, { backgroundColor: colors.accent }]}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search notes, tasks..."
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
            />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            {quickStats.map((stat, index) => (
              <View key={index} style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                <Text style={[styles.statCount, { color: colors.text }]} className="font-[InterBold]">
                  {stat.count}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]} className="font-[InterMedium]">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Recent Items */}
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary }}>Loading...</Text>
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]} className="font-[InterBold]">
                  Recent Items
                </Text>
                <TouchableOpacity onPress={() => router.push('/notes')}>
                  <Text style={[styles.seeAll, { color: colors.accent }]} className="font-[InterMedium]">
                    See All
                  </Text>
                </TouchableOpacity>
              </View>
              {recentNotes.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemCard, { backgroundColor: colors.surface }]}
                  onPress={() => router.push(`/notes/${item.id}`)}
                >
                  <View style={[styles.itemIcon, { backgroundColor: colors.accent }]}>
                    <Ionicons name="document-text" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, { color: colors.text }]} className="font-[InterMedium]">
                      {item.title}
                    </Text>
                    <Text style={[styles.itemPreview, { color: colors.textSecondary }]} className="font-[Inter]">
                      {item.content.length > 80 ? item.content.slice(0, 80) + '...' : item.content}
                    </Text>
                    <Text style={[styles.itemDate, { color: colors.textSecondary }]} className="font-[Inter]">
                      {item.date}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]} className="font-[InterBold]">
              Quick Actions
            </Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: colors.surface }]}
                onPress={() => router.push('../(tabs)/recording')}
              >
                <Ionicons name="mic" size={24} color={colors.primary} />
                <Text style={[styles.quickActionText, { color: colors.text }]} className="font-[InterMedium]">
                  Record
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: colors.surface }]}
                onPress={() => router.push('../(tabs)/TasksScreen')}
              >
                <Ionicons name="add-circle" size={24} color={colors.primary} />
                <Text style={[styles.quickActionText, { color: colors.text }]} className="font-[InterMedium]">
                  New Task
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: colors.surface }]}
                onPress={() => router.push('../(tabs)/CalendarScreen')}
              >
                <Ionicons name="calendar" size={24} color={colors.primary} />
                <Text style={[styles.quickActionText, { color: colors.text }]} className="font-[InterMedium]">
                  Schedule
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
        <View style={{ position: 'absolute', bottom: 32, right: 24, zIndex: 100 }}>
          <FloatingActionButton />
        </View>
        {/* Left Drawer Modal */}
        <Modal
          visible={drawerOpen}
          transparent
          onRequestClose={closeDrawer}
        >
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Animated.View style={{
              height: '100%',
              width: drawerWidth,
              backgroundColor: colors.background,
              paddingTop: 80,
              paddingHorizontal: 18,
              shadowColor: '#000',
              shadowOffset: { width: 2, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 10,
              transform: [{ translateX: drawerAnim }],
            }}>
              {/* Profile Section */}
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Ionicons name="person" size={54} color={colors.primary} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 2 }}>John Doe</Text>
                <Text style={{ fontSize: 15, color: colors.textSecondary }}>john@example.com</Text>
              </View>
              {/* Main Settings Option */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border }}
                onPress={() => { closeDrawer(); router.push('/settings'); }}
              >
                <Ionicons name="settings-outline" size={24} color={colors.primary} style={{ marginRight: 16 }} />
                <Text style={{ fontSize: 16, color: colors.text }}>Settings</Text>
              </TouchableOpacity>
              {/* Sub Settings */}
              {settingsOptions.map((item) => (
                <TouchableOpacity
                  key={item.path}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border }}
                  onPress={() => { closeDrawer(); router.push(item.path as any); }}
                >
                  <Ionicons name={item.icon as any} size={24} color={colors.primary} style={{ marginRight: 16 }} />
                  <Text style={{ fontSize: 16, color: colors.text }}>{item.label}</Text>
                </TouchableOpacity>
              ))}
              {/* Log Out Button */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, marginTop: 24 }}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={24} color={colors.error} style={{ marginRight: 16 }} />
                <Text style={{ fontSize: 16, color: colors.error }}>Log Out</Text>
              </TouchableOpacity>
            </Animated.View>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} onPress={closeDrawer} />
          </View>
        </Modal>
     
    </DarkGradientBackground>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: { flex: 1, paddingHorizontal: 20 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    marginHorizontal: 4,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statCount: { fontSize: 20 },
  statLabel: { fontSize: 12 },
  section: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20 },
  seeAll: { fontSize: 14 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 16 },
  itemPreview: { fontSize: 14 },
  itemDate: { fontSize: 12 },
  quickActions: { flexDirection: "row", justifyContent: "space-between" },
  quickAction: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    marginHorizontal: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: { fontSize: 12, marginTop: 8 },
})

export default HomeScreen
