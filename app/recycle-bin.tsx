import { getRecycleBinNotebooks, restoreNotebookFromRecycleBin, permanentlyDeleteNotebook } from "@/api/notebooksApi";
import { getNotes, deleteNote, restoreNoteFromRecycleBin } from "@/api/notesApi";
import { getTasks, deleteTask, restoreTaskFromRecycleBin } from "@/api/tasksApi";
import { getRecordings, deleteRecording, restoreRecordingFromRecycleBin } from "@/api/recordingApi";
import type { Notebook, Note, Task, Recording } from "@/api/types";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DarkGradientBackground from '../components/DarkGradientBackground';

interface DeletedItem {
  id: string;
  type: 'notebook' | 'note' | 'task' | 'recording';
  title: string;
  deletedAt: string;
  originalItem: Notebook | Note | Task | Recording;
}

const RecycleBinScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchAllDeletedItems = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log('RecycleBinScreen - Fetching all deleted items...');
      
      // Fetch all items from different APIs
      const [notebooks, notes, tasks, recordings] = await Promise.all([
        getRecycleBinNotebooks(),
        getNotes(),
        getTasks(),
        getRecordings()
      ]);
      
      console.log('RecycleBinScreen - Fetched data:', { notebooks, notes, tasks, recordings });
      
      // Filter deleted items and combine them
      const deletedNotebooks = notebooks
        .filter(nb => nb.deletedAt)
        .map(nb => ({
          id: nb.id,
          type: 'notebook' as const,
          title: nb.title,
          deletedAt: nb.deletedAt!,
          originalItem: nb
        }));
      
      const deletedNotes = notes
        .filter(note => note.deletedAt)
        .map(note => ({
          id: note.id,
          type: 'note' as const,
          title: note.title,
          deletedAt: note.deletedAt!,
          originalItem: note
        }));
      
      const deletedTasks = tasks
        .filter(task => task.deletedAt)
        .map(task => ({
          id: task.id,
          type: 'task' as const,
          title: task.title,
          deletedAt: task.deletedAt!,
          originalItem: task
        }));
      
      const deletedRecordings = recordings
        .filter(recording => recording.deletedAt)
        .map(recording => ({
          id: recording.id,
          type: 'recording' as const,
          title: recording.title,
          deletedAt: recording.deletedAt!,
          originalItem: recording
        }));
      
      // Combine all deleted items and sort by deletion date (newest first)
      const allDeletedItems = [
        ...deletedNotebooks,
        ...deletedNotes,
        ...deletedTasks,
        ...deletedRecordings
      ].sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
      
      console.log('RecycleBinScreen - All deleted items:', allDeletedItems);
      setDeletedItems(allDeletedItems);
      
    } catch (error) {
      console.error("Error loading deleted items:", error);
      Alert.alert("Error", "Failed to load deleted items");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    fetchAllDeletedItems(true);
  }, [fetchAllDeletedItems]);

  // Load data when component mounts
  useFocusEffect(
    useCallback(() => {
      fetchAllDeletedItems();
    }, [fetchAllDeletedItems])
  );

  const handleRestoreItem = async (item: DeletedItem) => {
    try {
      switch (item.type) {
        case 'notebook':
          await restoreNotebookFromRecycleBin(item.id);
          break;
        case 'note':
          await restoreNoteFromRecycleBin(item.id);
          break;
        case 'task':
          await restoreTaskFromRecycleBin(item.id);
          break;
        case 'recording':
          await restoreRecordingFromRecycleBin(item.id);
          break;
      }
      
      setDeletedItems(prev => prev.filter(deletedItem => deletedItem.id !== item.id));
      Alert.alert('Success', `"${item.title}" has been restored.`);
    } catch (error) {
      console.error('Error restoring item:', error);
      Alert.alert('Error', 'Failed to restore item. Please try again.');
    }
  };

  const handlePermanentlyDeleteItem = (item: DeletedItem) => {
    Alert.alert(
      'Permanently Delete',
      `Are you sure you want to permanently delete "${item.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              switch (item.type) {
                case 'notebook':
                  await permanentlyDeleteNotebook(item.id);
                  break;
                case 'note':
                  await deleteNote(item.id);
                  break;
                case 'task':
                  await deleteTask(item.id);
                  break;
                case 'recording':
                  await deleteRecording(item.id);
                  break;
              }
              
              setDeletedItems(prev => prev.filter(deletedItem => deletedItem.id !== item.id));
              Alert.alert('Success', `"${item.title}" has been permanently deleted.`);
            } catch (error) {
              console.error('Error permanently deleting item:', error);
              Alert.alert('Error', 'Failed to permanently delete item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDeletedDate = (deletedAt: string) => {
    const date = new Date(deletedAt);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'notebook':
        return 'book';
      case 'note':
        return 'document-text';
      case 'task':
        return 'checkmark-circle';
      case 'recording':
        return 'mic';
      default:
        return 'document';
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'notebook':
        return '#4E71FF';
      case 'note':
        return '#3B82F6';
      case 'task':
        return '#10B981';
      case 'recording':
        return '#F59E0B';
      default:
        return colors.primary;
    }
  };

  if (loading) {
    return (
      <DarkGradientBackground>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Loading recycle bin...</Text>
        </View>
      </DarkGradientBackground>
    );
  }

  return (
    <DarkGradientBackground>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Recycle Bin</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {deletedItems.length} {deletedItems.length === 1 ? 'deleted item' : 'deleted items'}
          </Text>
        </View>
      </View>

      {/* Deleted Items List */}
      <FlatList
        data={deletedItems}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <View style={[styles.itemCard, { backgroundColor: colors.surface }]}>
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <View style={styles.titleRow}>
                  <Ionicons 
                    name={getItemIcon(item.type) as any} 
                    size={20} 
                    color={getItemColor(item.type)} 
                    style={styles.itemIcon} 
                  />
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.itemType, { color: colors.textSecondary }]}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.deletedDate, { color: colors.textSecondary }]}>
                  Deleted on {formatDeletedDate(item.deletedAt)}
                </Text>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => handleRestoreItem(item)}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.actionButtonText}>Restore</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={() => handlePermanentlyDeleteItem(item)}
              >
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.actionButtonText}>Delete Permanently</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: insets.bottom + 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="trash-outline" size={64} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
              Recycle Bin is Empty
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', maxWidth: 260 }}>
              Deleted items from across the app will appear here. You can restore them or delete them permanently.
            </Text>
          </View>
        }
      />
    </DarkGradientBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  itemCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  itemHeader: {
    marginBottom: 16,
  },
  itemInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemType: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  deletedDate: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RecycleBinScreen; 