"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList } from "react-native"
import DarkGradientBackground from '../../components/DarkGradientBackground'

interface SharedNote {
  id: string;
  title: string;
  sender: string;
  senderAvatar: string;
  date: string;
  preview: string;
  isRead: boolean;
  type: 'note' | 'recording';
  duration?: string;
  size?: string;
}

const CommunityScreen = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')

  // Mock data for received shared content
  const receivedContent: SharedNote[] = [
    {
      id: '1',
      title: 'Meeting Notes - Q4 Planning',
      sender: 'Sarah Johnson',
      senderAvatar: 'SJ',
      date: '2024-01-15',
      preview: 'Key points from our quarterly planning session...',
      isRead: false,
      type: 'note'
    },
    {
      id: '2',
      title: 'Voice Memo - Project Update',
      sender: 'Mike Chen',
      senderAvatar: 'MC',
      date: '2024-01-14',
      preview: 'Quick update on the project progress...',
      isRead: true,
      type: 'recording',
      duration: '3:45',
      size: '2.1MB'
    },
    {
      id: '3',
      title: 'Ideas for New Feature',
      sender: 'Emma Davis',
      senderAvatar: 'ED',
      date: '2024-01-13',
      preview: 'Some thoughts on improving the user experience...',
      isRead: false,
      type: 'note'
    },
    {
      id: '4',
      title: 'Client Feedback Recording',
      sender: 'Alex Thompson',
      senderAvatar: 'AT',
      date: '2024-01-12',
      preview: 'Important feedback from our latest client meeting...',
      isRead: true,
      type: 'recording',
      duration: '8:20',
      size: '4.7MB'
    }
  ]

  // Mock data for sent shared content
  const sentContent: SharedNote[] = [
    {
      id: '5',
      title: 'Weekly Report',
      sender: 'You',
      senderAvatar: 'YO',
      date: '2024-01-15',
      preview: 'This week\'s progress and next steps...',
      isRead: true,
      type: 'note'
    },
    {
      id: '6',
      title: 'Team Meeting Notes',
      sender: 'You',
      senderAvatar: 'YO',
      date: '2024-01-14',
      preview: 'Summary of today\'s team meeting...',
      isRead: true,
      type: 'note'
    },
    {
      id: '7',
      title: 'Project Presentation',
      sender: 'You',
      senderAvatar: 'YO',
      date: '2024-01-13',
      preview: 'Presentation for the new project proposal...',
      isRead: false,
      type: 'recording',
      duration: '12:30',
      size: '6.8MB'
    }
  ]

  const handleContentPress = (item: SharedNote) => {
    Alert.alert(
      item.title,
      `From: ${item.sender}\nDate: ${item.date}\n\n${item.preview}`,
      [
        { text: "Close", style: "cancel" },
        { text: "Open", onPress: () => console.log('Opening content:', item.id) }
      ]
    )
  }

  const handleDeleteContent = (item: SharedNote) => {
    Alert.alert(
      "Delete Shared Content",
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            console.log('Deleting content:', item.id)
            Alert.alert("Deleted", "Content has been deleted successfully.")
          }
        }
      ]
    )
  }

  const handleMarkAsRead = (item: SharedNote) => {
    console.log('Marking as read:', item.id)
    Alert.alert("Marked as Read", "Content has been marked as read.")
  }

  const handleAddContent = () => {
    Alert.alert(
      "Share Content",
      "Choose what you'd like to share:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Share Note", 
          onPress: () => {
            Alert.alert(
              "Share Note",
              "Select a note to share with other users",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Browse Notes", 
                  onPress: () => {
                    // Navigate to notes screen for selection
                    router.push('/(tabs)/notes')
                  }
                },
                { 
                  text: "Recent Notes", 
                  onPress: () => {
                    // Show recent notes for quick selection
                    Alert.alert(
                      "Recent Notes",
                      "Select from your recent notes:",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Meeting Notes - Q4 Planning", onPress: () => handleShareNote("meeting-notes-q4") },
                        { text: "Project Ideas", onPress: () => handleShareNote("project-ideas") },
                        { text: "Weekly Report", onPress: () => handleShareNote("weekly-report") }
                      ]
                    )
                  }
                }
              ]
            )
          }
        },
        { 
          text: "Share Recording", 
          onPress: () => {
            Alert.alert(
              "Share Recording",
              "Select a recording to share with other users",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Browse Recordings", 
                  onPress: () => {
                    // Navigate to recordings screen for selection
                    router.push('/recording')
                  }
                },
                { 
                  text: "Recent Recordings", 
                  onPress: () => {
                    // Show recent recordings for quick selection
                    Alert.alert(
                      "Recent Recordings",
                      "Select from your recent recordings:",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Voice Memo - Project Update (3:45)", onPress: () => handleShareRecording("voice-memo-project") },
                        { text: "Client Feedback (8:20)", onPress: () => handleShareRecording("client-feedback") },
                        { text: "Team Meeting (12:30)", onPress: () => handleShareRecording("team-meeting") }
                      ]
                    )
                  }
                }
              ]
            )
          }
        }
      ]
    )
  }

  const handleShareNote = (noteId: string) => {
    Alert.alert(
      "Select Recipients",
      "Choose who you'd like to share this note with:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Select Users", 
          onPress: () => {
            Alert.alert(
              "User Selection",
              "Select users to share with:",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Sarah Johnson", onPress: () => handleShareWithUser(noteId, "sarah-johnson", "note") },
                { text: "Mike Chen", onPress: () => handleShareWithUser(noteId, "mike-chen", "note") },
                { text: "Emma Davis", onPress: () => handleShareWithUser(noteId, "emma-davis", "note") },
                { text: "Alex Thompson", onPress: () => handleShareWithUser(noteId, "alex-thompson", "note") }
              ]
            )
          }
        },
        { 
          text: "Share with Team", 
          onPress: () => {
            Alert.alert(
              "Share with Team",
              "Share this note with your entire team?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Share", 
                  onPress: () => {
                    console.log('Sharing note with team:', noteId)
                    Alert.alert("Success", "Note shared with your team successfully!")
                  }
                }
              ]
            )
          }
        }
      ]
    )
  }

  const handleShareRecording = (recordingId: string) => {
    Alert.alert(
      "Select Recipients",
      "Choose who you'd like to share this recording with:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Select Users", 
          onPress: () => {
            Alert.alert(
              "User Selection",
              "Select users to share with:",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Sarah Johnson", onPress: () => handleShareWithUser(recordingId, "sarah-johnson", "recording") },
                { text: "Mike Chen", onPress: () => handleShareWithUser(recordingId, "mike-chen", "recording") },
                { text: "Emma Davis", onPress: () => handleShareWithUser(recordingId, "emma-davis", "recording") },
                { text: "Alex Thompson", onPress: () => handleShareWithUser(recordingId, "alex-thompson", "recording") }
              ]
            )
          }
        },
        { 
          text: "Share with Team", 
          onPress: () => {
            Alert.alert(
              "Share with Team",
              "Share this recording with your entire team?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Share", 
                  onPress: () => {
                    console.log('Sharing recording with team:', recordingId)
                    Alert.alert("Success", "Recording shared with your team successfully!")
                  }
                }
              ]
            )
          }
        }
      ]
    )
  }

  const handleShareWithUser = (contentId: string, userId: string, contentType: 'note' | 'recording') => {
    console.log(`Sharing ${contentType} ${contentId} with user ${userId}`)
    Alert.alert(
      "Share Success",
      `${contentType === 'note' ? 'Note' : 'Recording'} shared successfully!`,
      [
        { 
          text: "Add Message", 
          onPress: () => {
            Alert.alert(
              "Add Message",
              "Add a personal message to your shared content:",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Send", 
                  onPress: () => {
                    console.log('Sending with message')
                    Alert.alert("Sent", "Content shared with your message!")
                  }
                }
              ]
            )
          }
        },
        { text: "OK", onPress: () => console.log('Share completed') }
      ]
    )
  }

  const renderContentItem = ({ item }: { item: SharedNote }) => {
    const isReceived = activeTab === 'received'
    
    return (
      <TouchableOpacity
        style={[
          styles.contentCard,
          {
            backgroundColor: colors.surface,
            borderColor: item.isRead ? colors.border : colors.primary,
            borderWidth: item.isRead ? 1 : 2,
          }
        ]}
        onPress={() => handleContentPress(item)}
      >
        <View style={styles.contentHeader}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.background }]}>
                {item.senderAvatar}
              </Text>
            </View>
            {!item.isRead && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]} />
            )}
          </View>
          
          <View style={styles.contentInfo}>
            <Text style={[styles.contentTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.senderName, { color: colors.textSecondary }]}>
              {item.sender}
            </Text>
            <Text style={[styles.contentDate, { color: colors.textSecondary }]}>
              {item.date}
            </Text>
          </View>

          <View style={styles.contentActions}>
            <View style={[styles.typeIcon, { backgroundColor: item.type === 'recording' ? '#F59E0B' : '#3B82F6' }]}>
              <Ionicons 
                name={item.type === 'recording' ? 'mic' : 'document-text'} 
                size={16} 
                color="white" 
              />
            </View>
            {item.type === 'recording' && (
              <Text style={[styles.durationText, { color: colors.textSecondary }]}>
                {item.duration}
              </Text>
            )}
          </View>
        </View>

        <Text style={[styles.contentPreview, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.preview}
        </Text>

        <View style={styles.actionButtons}>
          {isReceived && !item.isRead && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleMarkAsRead(item)}
            >
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={[styles.actionButtonText, { color: colors.background }]}>
                Mark Read
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleContentPress(item)}
          >
            <Ionicons name="eye" size={16} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => handleDeleteContent(item)}
          >
            <Ionicons name="trash" size={16} color="white" />
            <Text style={[styles.actionButtonText, { color: colors.background }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  const currentContent = activeTab === 'received' ? receivedContent : sentContent

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Community</Text>
        <TouchableOpacity onPress={handleAddContent}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'received' ? colors.primary : 'transparent',
              borderColor: colors.primary
            }
          ]}
          onPress={() => setActiveTab('received')}
        >
          <Ionicons 
            name="download" 
            size={20} 
            color={activeTab === 'received' ? colors.background : colors.primary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'received' ? colors.background : colors.primary }
          ]}>
            Received ({receivedContent.filter(item => !item.isRead).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'sent' ? colors.primary : 'transparent',
              borderColor: colors.primary
            }
          ]}
          onPress={() => setActiveTab('sent')}
        >
          <Ionicons 
            name="share" 
            size={20} 
            color={activeTab === 'sent' ? colors.background : colors.primary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'sent' ? colors.background : colors.primary }
          ]}>
            Sent ({sentContent.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      <FlatList
        data={currentContent}
        renderItem={renderContentItem}
        keyExtractor={(item) => item.id}
        style={styles.contentList}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={activeTab === 'received' ? 'download-outline' : 'share-outline'} 
              size={60} 
              color={colors.textSecondary} 
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No {activeTab === 'received' ? 'Received' : 'Sent'} Content
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {activeTab === 'received' 
                ? 'Content shared with you will appear here' 
                : 'Content you\'ve shared will appear here'
              }
            </Text>
          </View>
        }
      />
    </DarkGradientBackground>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  contentList: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
  },
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  senderName: {
    fontSize: 14,
    marginBottom: 2,
  },
  contentDate: {
    fontSize: 12,
  },
  contentActions: {
    alignItems: "flex-end",
  },
  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  durationText: {
    fontSize: 12,
  },
  contentPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
})

export default CommunityScreen
