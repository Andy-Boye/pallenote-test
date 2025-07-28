import { getNotes } from "@/api/notesApi";
import { getTasks } from "@/api/tasksApi";
import type { Note, Task, Recording } from "@/api/types";
import FloatingActionButton from '@/components/FloatingActionButton';
import RichNoteCard from '@/components/notes/RichNoteCard';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from "react";
import { Alert, Animated, Dimensions, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DarkGradientBackground from '../../components/DarkGradientBackground';

const HomeScreen = () => {
  const { colors, isDarkMode } = useTheme()
  const [searchText, setSearchText] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerAnim] = useState(new Animated.Value(-Dimensions.get('window').width * 0.5))
  const drawerWidth = Dimensions.get('window').width * 0.5
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const waveAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch notes
        const notesData = await getNotes();
        setNotes(notesData);
        
        // Fetch tasks
        const tasksData = await getTasks();
        setTasks(tasksData);
        
        // Mock recordings data (since no API exists yet)
        setRecordings([
          {
            id: '1',
            title: 'Meeting Recording',
            duration: '5:30',
            date: '2024-01-15',
            size: '2.3MB'
          },
          {
            id: '2',
            title: 'Voice Note',
            duration: '1:45',
            date: '2024-01-14',
            size: '0.8MB'
          },
          {
            id: '3',
            title: 'Interview',
            duration: '12:20',
            date: '2024-01-13',
            size: '5.1MB'
          },
          {
            id: '4',
            title: 'Quick Note',
            duration: '0:30',
            date: '2024-01-12',
            size: '0.3MB'
          },
          {
            id: '5',
            title: 'Presentation',
            duration: '8:15',
            date: '2024-01-11',
            size: '3.7MB'
          }
        ]);
      } catch (error) {
        console.error("Fetch data error:", error);
        // Fallback to mock data when API fails
        setNotes([
          {
            id: '1',
            title: 'Welcome to PalNote',
            content: 'This is your first note. Start creating and organizing your thoughts!',
            date: '2024-01-15',
            notebookId: 'default'
          },
          {
            id: '2',
            title: 'Meeting Notes',
            content: 'Team sync discussion points and action items for the week.',
            date: '2024-01-14',
            notebookId: 'default'
          },
          {
            id: '3',
            title: 'Shopping List',
            content: 'Groceries and household items needed for the week.',
            date: '2024-01-13',
            notebookId: 'default'
          }
        ]);
        setTasks([
          {
            id: '1',
            title: 'Complete project proposal',
            completed: false,
            dueDate: '2024-01-20'
          },
          {
            id: '2',
            title: 'Review meeting notes',
            completed: true,
            dueDate: '2024-01-18'
          },
          {
            id: '3',
            title: 'Update documentation',
            completed: false,
            dueDate: '2024-01-25'
          },
          {
            id: '4',
            title: 'Schedule team meeting',
            completed: false,
            dueDate: '2024-01-22'
          },
          {
            id: '5',
            title: 'Prepare presentation',
            completed: true,
            dueDate: '2024-01-16'
          },
          {
            id: '6',
            title: 'Send follow-up emails',
            completed: false,
            dueDate: '2024-01-19'
          },
          {
            id: '7',
            title: 'Update project timeline',
            completed: false,
            dueDate: '2024-01-23'
          },
          {
            id: '8',
            title: 'Review code changes',
            completed: true,
            dueDate: '2024-01-17'
          }
        ]);
        setRecordings([
          {
            id: '1',
            title: 'Meeting Recording',
            duration: '5:30',
            date: '2024-01-15',
            size: '2.3MB'
          },
          {
            id: '2',
            title: 'Voice Note',
            duration: '1:45',
            date: '2024-01-14',
            size: '0.8MB'
          },
          {
            id: '3',
            title: 'Interview',
            duration: '12:20',
            date: '2024-01-13',
            size: '5.1MB'
          },
          {
            id: '4',
            title: 'Quick Note',
            duration: '0:30',
            date: '2024-01-12',
            size: '0.3MB'
          },
          {
            id: '5',
            title: 'Presentation',
            duration: '8:15',
            date: '2024-01-11',
            size: '3.7MB'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const recentNotes = notes.slice(0, 3);
  const quickStats = [
    { label: "Notes", count: notes.length, icon: "document-text-outline", color: "#3B82F6", gradient: ["#3B82F6", "#1D4ED8"] },
    { label: "Tasks", count: tasks.length, icon: "checkbox-outline", color: "#10B981", gradient: ["#10B981", "#059669"] },
    { label: "Recordings", count: recordings.length, icon: "mic-outline", color: "#F59E0B", gradient: ["#F59E0B", "#D97706"] },
  ]

  const settingsOptions = [
    { label: "Account Info", path: "/settings/account-info", icon: "person-outline" },
    { label: "Payment Plan", path: "/settings/payment-plan", icon: "card-outline" },
    { label: "Language", path: "/settings/language", icon: "language-outline" },
    { label: "Privacy Policy", path: "/settings/privacy-policy", icon: "shield-outline" },
    { label: "Community", path: "/settings/community", icon: "people-outline" },
    { label: "FAQ", path: "/settings/faq", icon: "help-circle-outline" },
    { label: "About Us", path: "/settings/about-us", icon: "information-circle-outline" },
  ]

  const handleSearch = () => Alert.alert("Search", `Searching for: ${searchText}`)
  const handleNotifications = () => {
    console.log('Notification icon pressed');
    try {
      router.push('/notification');
    } catch (error) {
      console.error('Error navigating to notification:', error);
      Alert.alert('Error', 'Could not open notifications');
    }
  }
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            closeDrawer();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const openDrawer = () => {
    console.log('Drawer icon pressed');
    setDrawerOpen(true)
    console.log('Drawer state set to:', true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }

  const closeDrawer = () => {
    console.log('Closing drawer');
    Animated.timing(drawerAnim, {
      toValue: -drawerWidth,
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: false,
    }).start(() => setDrawerOpen(false))
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  // Wave animation effect - Simplified and more reliable
  useEffect(() => {
    const wave = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnimation, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnimation, {
            toValue: 0,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
        {
          iterations: -1, // Infinite loop
        }
      ).start();
    };

    // Start waving after a short delay
    const timer = setTimeout(wave, 1000);
    return () => clearTimeout(timer);
  }, []);

  const waveRotation = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'], // Even bigger rotation
  });

  // Stats are now display-only (no navigation)
  const handleStatPress = () => {
    // Do nothing - stats are now display-only
  }

  return (
    <DarkGradientBackground>
      <StatusBar style="light" />
      
             {/* Enhanced Header */}
       <View style={[styles.header, { 
         backgroundColor: colors.surface,
         borderBottomColor: colors.border,
         borderBottomWidth: 1,
       }]}>
        <View style={styles.headerTop}>
                     <TouchableOpacity 
             style={[styles.headerButton, { 
               backgroundColor: colors.card,
               borderColor: colors.border,
               borderWidth: 1,
             }]} 
             onPress={openDrawer}
             activeOpacity={0.7}
             hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
           >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]} className="font-[Inter]">
              {getGreeting()}
            </Text>
            <Text style={[styles.userName, { color: colors.text }]} className="font-[InterBold]">
              John! <Animated.Text style={{ transform: [{ rotate: waveRotation }] }}>👋</Animated.Text>
            </Text>
          </View>
          
                     <TouchableOpacity 
             style={[styles.headerButton, { 
               backgroundColor: colors.card,
               borderColor: colors.border,
               borderWidth: 1,
             }]} 
             onPress={handleNotifications}
             activeOpacity={0.7}
             hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
           >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            <View style={[styles.notificationBadge, { backgroundColor: colors.error }]} />
          </TouchableOpacity>
        </View>

                 {/* Enhanced Search Bar */}
         <View style={[styles.searchContainer, { 
           backgroundColor: colors.card,
           borderColor: colors.border,
           borderWidth: 1,
         }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search notes, tasks, recordings..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Enhanced Quick Stats */}
        <View style={styles.statsContainer}>
          {quickStats.map((stat, index) => (
                                     <TouchableOpacity
              key={index} 
              style={[styles.statCard, { 
                backgroundColor: colors.surface, 
                borderWidth: 1, 
                borderColor: colors.border,
                shadowColor: colors.text,
                shadowOpacity: 0.1,
              }]}
              activeOpacity={0.8}
              onPress={handleStatPress}
            >
                             <View style={[styles.statIconContainer, { 
                 backgroundColor: `${stat.color}20`,
                 borderColor: `${stat.color}30`,
                 borderWidth: 1,
               }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={[styles.statCount, { color: colors.text }]} className="font-[InterBold]">
                {stat.count}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]} className="font-[InterMedium]">
                {stat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Enhanced Recent Items */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading your notes...</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]} className="font-[InterBold]">
                  Recent Notes
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]} className="font-[Inter]">
                  Your latest thoughts and ideas
                </Text>
              </View>
                             <TouchableOpacity 
                 style={[styles.seeAllButton, { 
                   backgroundColor: colors.primary,
                   borderColor: colors.primary,
                   borderWidth: 1,
                   shadowColor: colors.primary,
                   shadowOpacity: 0.3,
                 }]}
                 onPress={() => router.push('/(tabs)/notes')}
               >
                <Text style={styles.seeAllButtonText} className="font-[InterMedium]">
                  View All
                </Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </TouchableOpacity>
            </View>
            
            {recentNotes.length > 0 ? (
              recentNotes.map((item, index) => (
                <RichNoteCard
                  key={item.id}
                  note={item}
                  onEdit={(editedNote) => {
                    // Handle note editing
                    console.log('Editing note:', editedNote);
                    // You can implement API call here to update the note
                  }}
                  onDelete={(noteId) => {
                    // Handle note deletion
                    console.log('Deleting note:', noteId);
                    // You can implement API call here to delete the note
                  }}
                  onShare={(note) => {
                    // Handle note sharing
                    console.log('Sharing note:', note);
                    // You can implement sharing functionality here
                  }}
                />
              ))
            ) : (
                             <View style={[styles.emptyState, { 
                 backgroundColor: colors.surface,
                 borderColor: colors.border,
                 borderWidth: 1,
                 shadowColor: colors.text,
                 shadowOpacity: 0.1,
               }]}>
                <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyStateTitle, { color: colors.text }]} className="font-[InterMedium]">
                  No notes yet
                </Text>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]} className="font-[Inter]">
                  Create your first note to get started
                </Text>
                                 <TouchableOpacity 
                   style={[styles.emptyStateButton, { 
                     backgroundColor: colors.primary,
                     borderColor: colors.primary,
                     borderWidth: 1,
                     shadowColor: colors.primary,
                     shadowOpacity: 0.3,
                   }]}
                   onPress={() => router.push('/notes/new')}
                 >
                  <Text style={styles.emptyStateButtonText} className="font-[InterMedium]">
                    Create Note
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Enhanced Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]} className="font-[InterBold]">
                Quick Actions
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]} className="font-[Inter]">
                Get things done faster
              </Text>
            </View>
          </View>
          
          <View style={styles.quickActions}>
                         <TouchableOpacity
               style={[styles.quickAction, { 
                 backgroundColor: colors.surface,
                 borderColor: colors.border,
                 borderWidth: 1,
                 shadowColor: colors.text,
                 shadowOpacity: 0.1,
               }]}
               onPress={() => router.push('/recording')}
               activeOpacity={0.8}
             >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.error }]}>
                <Ionicons name="mic" size={24} color="white" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]} className="font-[InterMedium]">
                Record
              </Text>
              <Text style={[styles.quickActionSubtext, { color: colors.textSecondary }]} className="font-[Inter]">
                Voice notes
              </Text>
            </TouchableOpacity>

                         <TouchableOpacity
               style={[styles.quickAction, { 
                 backgroundColor: colors.surface,
                 borderColor: colors.border,
                 borderWidth: 1,
                 shadowColor: colors.text,
                 shadowOpacity: 0.1,
               }]}
               onPress={() => router.push('/(tabs)/tasks')}
               activeOpacity={0.8}
             >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.warning }]}>
                <Ionicons name="add-circle" size={24} color="white" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]} className="font-[InterMedium]">
                New Task
              </Text>
              <Text style={[styles.quickActionSubtext, { color: colors.textSecondary }]} className="font-[Inter]">
                Stay organized
              </Text>
            </TouchableOpacity>

                         <TouchableOpacity
               style={[styles.quickAction, { 
                 backgroundColor: colors.surface,
                 borderColor: colors.border,
                 borderWidth: 1,
                 shadowColor: colors.text,
                 shadowOpacity: 0.1,
               }]}
               onPress={() => router.push('/(tabs)/calendar')}
               activeOpacity={0.8}
             >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.success }]}>
                <Ionicons name="calendar" size={24} color="white" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]} className="font-[InterMedium]">
                Schedule
              </Text>
              <Text style={[styles.quickActionSubtext, { color: colors.textSecondary }]} className="font-[Inter]">
                Plan ahead
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing for FAB */}
        <View style={{ height: 120 }} />
      </ScrollView>
      
      {/* Floating Action Button */}
      <View style={{ position: 'absolute', bottom: 32, right: 24, zIndex: 100 }}>
        <FloatingActionButton />
      </View>

      {/* Enhanced Left Drawer Modal */}
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
            shadowColor: '#000',
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 10,
            transform: [{ translateX: drawerAnim }],
          }}>
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingTop: 40, paddingHorizontal: 18, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
            {/* Enhanced Profile Section */}
            <View style={styles.profileSection}>
              <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="person" size={40} color="white" />
              </View>
              <Text style={[styles.profileName, { color: colors.text }]} className="font-[InterBold]">
                John Doe
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]} className="font-[Inter]">
                john@example.com
              </Text>
              <View style={[styles.profileStatus, { backgroundColor: colors.success }]}>
                <Text style={styles.profileStatusText} className="font-[InterMedium]">
                  Pro Member
                </Text>
              </View>
            </View>

            {/* Enhanced Settings Options */}
            <TouchableOpacity
              style={[styles.drawerOption, { borderBottomColor: colors.border }]}
              onPress={() => { closeDrawer(); router.push('/settings'); }}
            >
              <View style={[styles.drawerIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="settings-outline" size={20} color="white" />
              </View>
              <Text style={[styles.drawerOptionText, { color: colors.text }]} className="font-[InterMedium]">
                Settings
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {settingsOptions.map((item) => (
              <TouchableOpacity
                key={item.path}
                style={[styles.drawerOption, { borderBottomColor: colors.border }]}
                onPress={() => { closeDrawer(); router.push(item.path as any); }}
              >
                <View style={[styles.drawerIcon, { backgroundColor: colors.accent }]}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={18} 
                    color={isDarkMode ? 'white' : colors.primary} 
                  />
                </View>
                <Text style={[styles.drawerOptionText, { color: colors.text }]} className="font-[InterMedium]">
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}

            {/* Enhanced Log Out Button */}
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: colors.error }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.logoutButtonText} className="font-[InterMedium]">
                Log Out
              </Text>
            </TouchableOpacity>
            </ScrollView>
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
     paddingBottom: 24,
     borderBottomLeftRadius: 24,
     borderBottomRightRadius: 24,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.1,
     shadowRadius: 12,
     elevation: 12,
     zIndex: 1000,
     position: 'relative',
   },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
     headerButton: {
     width: 48,
     height: 48,
     borderRadius: 24,
     alignItems: 'center',
     justifyContent: 'center',
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.08,
     shadowRadius: 6,
     elevation: 4,
     zIndex: 1001,
     position: 'relative',
   },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
     searchContainer: {
     flexDirection: "row",
     alignItems: "center",
     paddingHorizontal: 16,
     paddingVertical: 14,
     borderRadius: 16,
     gap: 12,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.08,
     shadowRadius: 6,
     elevation: 4,
   },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 32,
    gap: 12,
  },
           statCard: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 20,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 6,
    },
  statIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statCount: { 
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: { 
    fontSize: 13,
  },
  section: { 
    marginBottom: 32 
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: { 
    fontSize: 22,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  seeAllButtonText: {
    color: 'white',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  itemContent: { 
    flex: 1 
  },
  itemTitle: { 
    fontSize: 16,
    marginBottom: 4,
  },
  itemPreview: { 
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemDate: { 
    fontSize: 12,
  },
  itemType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  itemTypeText: {
    color: 'white',
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 14,
  },
  quickActions: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    gap: 12,
  },
     quickAction: {
     flex: 1,
     alignItems: "center",
     paddingVertical: 24,
     borderRadius: 16,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 3 },
     shadowOpacity: 0.1,
     shadowRadius: 6,
     elevation: 4,
   },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: { 
    fontSize: 14,
    marginBottom: 4,
  },
  quickActionSubtext: {
    fontSize: 11,
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  profileStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileStatusText: {
    color: 'white',
    fontSize: 12,
  },
  drawerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  drawerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  drawerOptionText: {
    fontSize: 16,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
  },
})

export default HomeScreen
