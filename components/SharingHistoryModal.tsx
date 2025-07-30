import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  getSharingHistory, 
  getSentShares, 
  getReceivedShares, 
  revokeSharedNote 
} from '@/api/notesApi';
import type { SharingRecord } from '@/api/backendTypes';

interface SharingHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'all' | 'sent' | 'received';

const SharingHistoryModal: React.FC<SharingHistoryModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [sharingHistory, setSharingHistory] = useState<SharingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    activeShares: 0,
    recentShares: 0,
  });

  useEffect(() => {
    if (visible) {
      loadSharingHistory();
    }
  }, [visible, activeTab]);

  const loadSharingHistory = async () => {
    setIsLoading(true);
    try {
      let history: SharingRecord[] = [];
      
      switch (activeTab) {
        case 'all':
          history = await getSharingHistory();
          break;
        case 'sent':
          history = await getSentShares();
          break;
        case 'received':
          history = await getReceivedShares();
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
    <View key={record.id} style={[styles.recordCard, { backgroundColor: colors.background }]}>
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.modal, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="time" size={24} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>
                Sharing History
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={[styles.statsContainer, { backgroundColor: colors.background }]}>
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

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {(['all', 'sent', 'received'] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  {
                    backgroundColor: activeTab === tab ? colors.primary : colors.background,
                    borderColor: activeTab === tab ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === tab ? '#fff' : colors.text,
                    },
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading sharing history...
                </Text>
              </View>
            ) : sharingHistory.length > 0 ? (
              <View style={styles.recordsContainer}>
                {sharingHistory.map(renderSharingRecord)}
              </View>
            ) : (
              renderEmptyState()
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
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
  recordsContainer: {
    gap: 16,
  },
  recordCard: {
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
});

export default SharingHistoryModal; 