"use client"

import { useTheme } from "@/contexts/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState, useEffect } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator, TextInput, Modal } from "react-native"
import DarkGradientBackground from '../../components/DarkGradientBackground'
import { 
  getSharingHistory, 
  getSentShares, 
  getReceivedShares, 
  revokeSharedNote 
} from '@/api/notesApi';
import type { SharingRecord } from '@/api/backendTypes';

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

interface PallenoteUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

type TabType = 'received' | 'sent' | 'history' | 'search';

const CommunityScreen = () => {
  const { colors } = useTheme()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('received')
  const [sharingHistory, setSharingHistory] = useState<SharingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PallenoteUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    activeShares: 0,
    recentShares: 0,
  });

  // Mock Pallenote users for search functionality
  const mockPallenoteUsers: PallenoteUser[] = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', avatar: 'SJ', isOnline: true, lastSeen: '2 minutes ago' },
    { id: '2', name: 'Mike Chen', email: 'mike.chen@example.com', avatar: 'MC', isOnline: false, lastSeen: '1 hour ago' },
    { id: '3', name: 'Emma Davis', email: 'emma.davis@example.com', avatar: 'ED', isOnline: true, lastSeen: '5 minutes ago' },
    { id: '4', name: 'Alex Thompson', email: 'alex.thompson@example.com', avatar: 'AT', isOnline: false, lastSeen: '3 hours ago' },
    { id: '5', name: 'Jessica Lee', email: 'jessica.lee@example.com', avatar: 'JL', isOnline: true, lastSeen: '1 minute ago' },
    { id: '6', name: 'David Wilson', email: 'david.wilson@example.com', avatar: 'DW', isOnline: false, lastSeen: '2 days ago' },
  ];

  // Mock data for received shared content (keeping for backward compatibility)
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
  ]

  // Mock data for sent shared content (keeping for backward compatibility)
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

  useEffect(() => {
    loadSharingHistory();
  }, [activeTab]);

  const loadSharingHistory = async () => {
    setIsLoading(true);
    try {
      let history: SharingRecord[] = [];
      
      switch (activeTab) {
        case 'received':
          history = await getReceivedShares();
          break;
        case 'sent':
          history = await getSentShares();
          break;
        case 'history':
          // Combine sent and received for history tab
          const sentShares = await getSentShares();
          const receivedShares = await getReceivedShares();
          history = [...sentShares, ...receivedShares].sort((a, b) => 
            new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime()
          );
          break;
        case 'search':
          // Search functionality will be handled separately
          break;
      }
      
      setSharingHistory(history);
      
      // Calculate stats
      const allHistory = await getSharingHistory();
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      setStats({
        totalSent: allHistory.filter(record => record.status === 'sent').length,
        totalReceived: allHistory.filter(record => record.status === 'received').length,
        activeShares: allHistory.filter(record => record.isActive).length,
        recentShares: allHistory.filter(record => 
          new Date(record.sharedAt) > oneWeekAgo
        ).length,
      });
    } catch (error) {
      console.error('Error loading sharing history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock users based on search query
      const filtered = mockPallenoteUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleShareWithUser = (user: PallenoteUser) => {
    Alert.alert(
      `Share with ${user.name}`,
      `Choose what you'd like to share with ${user.name}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share Note', 
          onPress: () => {
            Alert.alert(
              'Select Note',
              'Choose a note to share:',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Meeting Notes - Q4 Planning', onPress: () => handleShareNoteWithUser(user, 'meeting-notes-q4') },
                { text: 'Project Ideas', onPress: () => handleShareNoteWithUser(user, 'project-ideas') },
                { text: 'Weekly Report', onPress: () => handleShareNoteWithUser(user, 'weekly-report') }
              ]
            );
          }
        },
        { 
          text: 'Share Recording', 
          onPress: () => {
            Alert.alert(
              'Select Recording',
              'Choose a recording to share:',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Voice Memo - Project Update (3:45)', onPress: () => handleShareRecordingWithUser(user, 'voice-memo-project') },
                { text: 'Client Feedback (8:20)', onPress: () => handleShareRecordingWithUser(user, 'client-feedback') },
                { text: 'Team Meeting (12:30)', onPress: () => handleShareRecordingWithUser(user, 'team-meeting') }
              ]
            );
          }
        }
      ]
    );
  };

  const handleShareNoteWithUser = (user: PallenoteUser, noteId: string) => {
    console.log(`Sharing note ${noteId} with user ${user.name}`);
    Alert.alert(
      'Share Success',
      `Note shared successfully with ${user.name}!`,
      [
        { 
          text: 'Add Message', 
          onPress: () => {
            Alert.alert(
              'Add Message',
              'Add a personal message to your shared note:',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Send', 
                  onPress: () => {
                    console.log('Sending with message');
                    Alert.alert('Sent', 'Note shared with your message!');
                  }
                }
              ]
            );
          }
        },
        { text: 'OK', onPress: () => console.log('Share completed') }
      ]
    );
  };

  const handleShareRecordingWithUser = (user: PallenoteUser, recordingId: string) => {
    console.log(`Sharing recording ${recordingId} with user ${user.name}`);
    Alert.alert(
      'Share Success',
      `Recording shared successfully with ${user.name}!`,
      [
        { 
          text: 'Add Message', 
          onPress: () => {
            Alert.alert(
              'Add Message',
              'Add a personal message to your shared recording:',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Send', 
                  onPress: () => {
                    console.log('Sending with message');
                    Alert.alert('Sent', 'Recording shared with your message!');
                  }
                }
              ]
            );
          }
        },
        { text: 'OK', onPress: () => console.log('Share completed') }
      ]
    );
  };

  const handleRevokeShare = async (shareId: string, noteTitle: string) => {
    Alert.alert(
      'Revoke Share',
      `Are you sure you want to revoke access to "${noteTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeSharedNote(shareId);
              await loadSharingHistory(); // Reload the list
              Alert.alert('Success', 'Share access revoked successfully');
            } catch (error) {
              console.error('Error revoking share:', error);
              Alert.alert('Error', 'Failed to revoke share access');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: 'sent' | 'received') => {
    return status === 'sent' ? 'arrow-up' : 'arrow-down';
  };

  const getAccessTypeIcon = (accessType: 'Viewer' | 'Editor') => {
    return accessType === 'Viewer' ? 'eye' : 'create';
  };

  const getStatusColor = (status: 'sent' | 'received') => {
    return status === 'sent' ? '#4CAF50' : '#2196F3';
  };

  const renderSharingRecord = (record: SharingRecord) => (
    <View key={record.id} style={[styles.sharingRecordCard, { backgroundColor: colors.surface }]}>
      <View style={styles.recordHeader}>
        <View style={styles.recordInfo}>
          <View style={styles.recordTitleRow}>
            <Ionicons 
              name={getStatusIcon(record.status)} 
              size={16} 
              color={getStatusColor(record.status)} 
            />
            <Text style={[styles.recordTitle, { color: colors.text }]}>
              {record.noteTitle}
            </Text>
            {!record.isActive && (
              <View style={[styles.inactiveBadge, { backgroundColor: colors.textSecondary }]}>
                <Text style={styles.inactiveText}>Inactive</Text>
              </View>
            )}
          </View>
          <Text style={[styles.recordSubtitle, { color: colors.textSecondary }]}>
            {record.status === 'sent' ? 'Sent to' : 'Received from'}: {record.recipientEmail}
          </Text>
        </View>
        <View style={styles.recordActions}>
          <View style={[styles.accessTypeBadge, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons 
              name={getAccessTypeIcon(record.accessType)} 
              size={14} 
              color={colors.primary} 
            />
            <Text style={[styles.accessTypeText, { color: colors.primary }]}>
              {record.accessType}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.recordDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {formatDate(record.sharedAt)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="link-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
            {record.shareUrl}
          </Text>
        </View>
      </View>
      
      {record.status === 'sent' && record.isActive && (
        <TouchableOpacity
          style={[styles.revokeButton, { borderColor: colors.border }]}
          onPress={() => handleRevokeShare(record.shareId, record.noteTitle)}
        >
          <Ionicons name="close-circle-outline" size={16} color="#FF6B6B" />
          <Text style={[styles.revokeButtonText, { color: '#FF6B6B' }]}>
            Revoke Access
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderUserSearchResult = (user: PallenoteUser) => (
    <TouchableOpacity
      key={user.id}
      style={[styles.userSearchCard, { backgroundColor: colors.surface }]}
      onPress={() => handleShareWithUser(user)}
    >
      <View style={styles.userSearchHeader}>
        <View style={styles.userAvatarContainer}>
          <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.userAvatarText, { color: colors.background }]}>
              {user.avatar}
            </Text>
          </View>
          <View style={[styles.onlineIndicator, { 
            backgroundColor: user.isOnline ? colors.success : colors.textSecondary 
          }]} />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user.name}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user.email}
          </Text>
          <Text style={[styles.userLastSeen, { color: colors.textSecondary }]}>
            {user.isOnline ? 'Online' : `Last seen ${user.lastSeen}`}
          </Text>
        </View>
        
        <Ionicons name="share-outline" size={20} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="share-outline" size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        No {activeTab === 'sent' ? 'sent' : activeTab === 'received' ? 'received' : ''} shares yet
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
        {activeTab === 'sent' 
          ? 'Start sharing your notes to see them here'
          : activeTab === 'received' 
          ? 'When others share notes with you, they\'ll appear here'
          : 'Start sharing notes to see your sharing history'
        }
      </Text>
    </View>
  );

  const renderSearchContent = () => (
    <View style={styles.searchContainer}>
      <View style={[styles.searchInputContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for Pallenote users..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchUsers}
        />
        <TouchableOpacity onPress={handleSearchUsers} disabled={isSearching}>
          {isSearching ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>
      
      {searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <Text style={[styles.searchResultsTitle, { color: colors.text }]}>
            Found {searchResults.length} user(s)
          </Text>
          {searchResults.map(renderUserSearchResult)}
        </View>
      )}
      
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <View style={styles.emptySearchState}>
          <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptySearchTitle, { color: colors.text }]}>
            No users found
          </Text>
          <Text style={[styles.emptySearchSubtitle, { color: colors.textSecondary }]}>
            Try searching with a different name or email
          </Text>
        </View>
      )}
    </View>
  );

  const renderSharingHistoryContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading sharing history...
          </Text>
        </View>
      );
    }

    if (sharingHistory.length > 0) {
      return (
        <View style={styles.sharingHistoryContainer}>
          {sharingHistory.map(renderSharingRecord)}
        </View>
      );
    }

    return renderEmptyState();
  };

  const renderContent = () => {
    if (activeTab === 'search') {
      return renderSearchContent();
    }

    if (activeTab === 'history') {
      return renderSharingHistoryContent();
    }

    const currentContent = activeTab === 'received' ? receivedContent : sentContent;
    
    return (
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
    );
  };

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Community</Text>
        <TouchableOpacity onPress={() => setShowSearchModal(true)}>
          <Ionicons name="search" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {stats.totalSent}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Sent
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {stats.totalReceived}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Received
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {stats.activeShares}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {stats.recentShares}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Recent
          </Text>
        </View>
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

        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'history' ? colors.primary : 'transparent',
              borderColor: colors.primary
            }
          ]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons 
            name="time" 
            size={20} 
            color={activeTab === 'history' ? colors.background : colors.primary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'history' ? colors.background : colors.primary }
          ]}>
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === 'search' ? colors.primary : 'transparent',
              borderColor: colors.primary
            }
          ]}
          onPress={() => setActiveTab('search')}
        >
          <Ionicons 
            name="search" 
            size={20} 
            color={activeTab === 'search' ? colors.background : colors.primary} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'search' ? colors.background : colors.primary }
          ]}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderContent()}
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Sharing History Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  sharingHistoryContainer: {
    padding: 20,
    gap: 16,
  },
  sharingRecordCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  inactiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  inactiveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  recordSubtitle: {
    fontSize: 14,
  },
  recordActions: {
    alignItems: 'flex-end',
  },
  accessTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  accessTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recordDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    flex: 1,
  },
  revokeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    gap: 6,
  },
  revokeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  // Search Styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 10,
  },
  searchResultsContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    marginTop: 8,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  userSearchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userSearchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  userLastSeen: {
    fontSize: 12,
    marginTop: 2,
  },
  emptySearchState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptySearchTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySearchSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  // Content Card Styles
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
