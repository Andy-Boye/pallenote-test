import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import DarkGradientBackground from '../components/DarkGradientBackground';

interface DeletedItem {
  id: string;
  type: 'note' | 'task' | 'recording';
  title: string;
  deletedDate: string;
  size?: string;
}

export default function RecycleBinScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  // Mock deleted items data
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([
    {
      id: '1',
      type: 'note',
      title: 'Old Meeting Notes',
      deletedDate: '2024-01-10',
    },
    {
      id: '2',
      type: 'task',
      title: 'Completed Project Tasks',
      deletedDate: '2024-01-08',
    },
    {
      id: '3',
      type: 'recording',
      title: 'Voice Memo',
      deletedDate: '2024-01-05',
      size: '2.1MB',
    },
    {
      id: '4',
      type: 'note',
      title: 'Shopping List',
      deletedDate: '2024-01-03',
    },
  ]);

  const handleRestore = (item: DeletedItem) => {
    Alert.alert(
      "Restore Item",
      `Are you sure you want to restore "${item.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: () => {
            setDeletedItems(prev => prev.filter(i => i.id !== item.id));
            Alert.alert("Success", "Item restored successfully!");
          }
        }
      ]
    );
  };

  const handlePermanentDelete = (item: DeletedItem) => {
    Alert.alert(
      "Permanently Delete",
      `Are you sure you want to permanently delete "${item.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDeletedItems(prev => prev.filter(i => i.id !== item.id));
            Alert.alert("Deleted", "Item permanently deleted.");
          }
        }
      ]
    );
  };

  const handleEmptyBin = () => {
    if (deletedItems.length === 0) {
      Alert.alert("Empty Bin", "Recycle bin is already empty.");
      return;
    }

    Alert.alert(
      "Empty Recycle Bin",
      "Are you sure you want to permanently delete all items? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Empty Bin",
          style: "destructive",
          onPress: () => {
            setDeletedItems([]);
            Alert.alert("Success", "Recycle bin emptied successfully!");
          }
        }
      ]
    );
  };

  const getItemIcon = (type: string) => {
    switch (type) {
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

  return (
    <DarkGradientBackground>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 0 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Recycle Bin</Text>
          <TouchableOpacity onPress={handleEmptyBin}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        {deletedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trash-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Recycle Bin is Empty</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Deleted items will appear here for 30 days
            </Text>
          </View>
        ) : (
          /* Items List */
          <View style={styles.content}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Deleted Items ({deletedItems.length})
            </Text>
            
            {deletedItems.map((item) => (
              <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <View style={[styles.itemIcon, { backgroundColor: getItemColor(item.type) }]}>
                      <Ionicons name={getItemIcon(item.type) as any} size={20} color="white" />
                    </View>
                    <View style={styles.itemDetails}>
                      <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                        Deleted on {item.deletedDate}
                        {item.size && ` • ${item.size}`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleRestore(item)}
                    >
                      <Ionicons name="refresh" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.error }]}
                      onPress={() => handlePermanentDelete(item)}
                    >
                      <Ionicons name="trash" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </DarkGradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  itemCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 14,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 