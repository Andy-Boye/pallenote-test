"use client"

import { deleteNotebook, getNotebooks, updateNotebook } from "@/api/notebooksApi";
import { getNotes } from "@/api/notesApi";
import type { Note, Notebook } from "@/api/types";
import CreateNotebookModal from "@/components/CreateNotebookModal";
import NotebookActionModal from "@/components/NotebookActionModal";
import SearchBar from "@/components/SearchBar";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DarkGradientBackground from '../../components/DarkGradientBackground';



const NotebooksScreen = () => {
  const router = useRouter()
  const { colors } = useTheme()
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null)
  const insets = useSafeAreaInsets();

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [notebooksData, notesData] = await Promise.all([
        getNotebooks(),
        getNotes()
      ]);
             setNotebooks(notebooksData);
       setNotes(notesData);
       console.log('=== NOTEBOOKS SCREEN DATA LOADED ===');
       console.log('NotebooksScreen - Loaded notebooks:', notebooksData);
       console.log('NotebooksScreen - Loaded notes:', notesData);
       console.log('NotebooksScreen - Notes with notebookId:', notesData.map(n => ({ id: n.id, title: n.title, notebookId: n.notebookId })));
       
       // Check specifically for notes in "My Notebook"
       const myNotebookNotes = notesData.filter(note => note.notebookId === 'default');
       console.log('NotebooksScreen - Notes in "My Notebook":', myNotebookNotes);
    } catch (err) {
      console.error("Error loading data:", err)
      Alert.alert("Error", "Failed to load notebooks and notes")
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Load data when component mounts
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data when screen comes into focus (e.g., when returning from notes page)
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const openNotebook = (notebook: any) => {
    console.log('Opening notebook:', notebook);
    console.log('notebook.id:', notebook.id);
    
    // For "My Notebook" (default), we need to pass the correct parameter
    const notebookId = notebook.id === 'default' ? 'default' : notebook.id;
    
    router.replace({
      pathname: "/notebooks/[notebookId]/[index]" as any,
      params: { notebookId: notebookId }
    })
  }

  const addNotebook = () => {
    console.log('Add notebook button pressed, setting modal to visible');
    setShowCreateModal(true)
  }

  const handleNotebookCreated = (newNotebook: Notebook) => {
    console.log('Notebook created callback triggered:', newNotebook);
    setNotebooks(prev => [...prev, newNotebook])
  }

  const handleLongPress = (notebook: Notebook) => {
    console.log('Long press on notebook:', notebook);
    setSelectedNotebook(notebook);
    setShowActionModal(true);
  };

  const handleRenameNotebook = async (notebookId: string, newTitle: string) => {
    try {
      await updateNotebook(notebookId, { title: newTitle });
      setNotebooks(prev => 
        prev.map(notebook => 
          notebook.id === notebookId 
            ? { ...notebook, title: newTitle }
            : notebook
        )
      );
      Alert.alert('Success', 'Notebook renamed successfully!');
    } catch (error) {
      console.error('Error renaming notebook:', error);
      Alert.alert('Error', 'Failed to rename notebook. Please try again.');
    }
  };

  const handleShareNotebook = (notebook: Notebook) => {
    Share.share({
      message: `Check out my notebook: ${notebook.title}`,
      title: notebook.title,
    });
  };

  const handleDeleteNotebookAndContents = async (notebookId: string) => {
    console.log(`=== STARTING NOTEBOOK DELETION ===`);
    console.log(`Notebook ID: ${notebookId}`);
    
    // Prevent deleting the default notebook
    if (notebookId === 'default') {
      Alert.alert('Cannot Delete', 'The default notebook cannot be deleted.');
      return;
    }

    try {
      console.log(`Calling deleteNotebook API with ID: ${notebookId}`);
      await deleteNotebook(notebookId);
      
      // Update local state
      setNotebooks(prev => {
        const filtered = prev.filter(notebook => notebook.id !== notebookId);
        console.log(`Updated notebooks list: ${prev.length} -> ${filtered.length} notebooks`);
        return filtered;
      });
      
      console.log('Notebook deletion completed successfully');
      Alert.alert('Success', 'Notebook has been deleted successfully.');
    } catch (error) {
      console.error('=== ERROR IN NOTEBOOK DELETION ===');
      console.error('Error deleting notebook:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
        url: (error as any)?.config?.url,
      });
      
      // Provide user-friendly error message
      let errorMessage = 'Failed to delete notebook. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Notebook not found. It may have already been deleted.';
        } else if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to delete this notebook.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  // Filter notebooks based on search query
  const filteredNotebooks = (notebooks || []).filter(notebook => 
    notebook.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalNotebooks = filteredNotebooks.length;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <DarkGradientBackground>
             {/* Modern Header */}
       <View style={[styles.header, { backgroundColor: 'transparent' }]}> 
         <View>
           <Text style={[styles.headerTitle, { color: colors.text }]}>Notebooks</Text>
           <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Organize your notes by topic</Text>
         </View>
       </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search notebooks..."
        onClear={() => setSearchQuery('')}
      />

             {/* Quick Stats */}
       <View style={styles.statsRow}>
         <Text style={[styles.statsText, { color: colors.textSecondary }]}>Total: {totalNotebooks}</Text>
       </View>

             {/* Notebook List */}
       <FlatList
         data={filteredNotebooks}
         keyExtractor={(item) => item.id}
         refreshControl={
           <RefreshControl
             refreshing={refreshing}
             onRefresh={onRefresh}
             colors={[colors.primary]}
             tintColor={colors.primary}
           />
         }
        renderItem={({ item }) => {
          const notebookNotes = item.id === 'default' 
            ? notes.filter(note => note.notebookId === 'default')
            : notes.filter(note => note.notebookId === item.id);
          
          console.log(`Notebook ${item.title} (${item.id}) has ${notebookNotes.length} notes:`, notebookNotes); // Debug log
          
          return (
            <TouchableOpacity 
              onPress={() => openNotebook(item)}
              onLongPress={() => handleLongPress(item)}
              style={[styles.notebookCard, { backgroundColor: colors.surface }]}
              activeOpacity={0.8}
              delayLongPress={500}
            >

              
              <View style={styles.notebookHeader}>
                <View style={styles.notebookInfo}>
                  <View style={styles.titleRow}>
                    <Ionicons name="book" size={20} color="#4E71FF" style={styles.notebookIcon} />
                    <Text style={[styles.notebookTitle, { color: colors.text }]}>{item.title}</Text>
                  </View>
                  <View style={styles.statsContainer}>
                    <View style={[styles.noteCountBadge, { backgroundColor: '#4E71FF' + '15' }]}>
                      <Ionicons name="document-text" size={14} color="#4E71FF" />
                      <Text style={[styles.noteCountText, { color: '#4E71FF' }]}>
                        {notebookNotes.length} {notebookNotes.length === 1 ? 'note' : 'notes'}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.moreButton}
                  onPress={() => handleLongPress(item)}
                >
                  <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              {/* Show preview of recent notes */}
              {notebookNotes.length > 0 && (
                <View style={styles.notesPreviewContainer}>
                  {notebookNotes.slice(0, 2).map((note, index) => (
                    <View key={note.id} style={[styles.notePreview, index === 0 && styles.firstNotePreview]}>
                      <View style={styles.notePreviewContent}>
                        <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} style={styles.noteIcon} />
                        <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={1}>
                          {note.title}
                        </Text>
                      </View>
                      <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
                        {note.date}
                      </Text>
                    </View>
                  ))}
                  
                  {notebookNotes.length > 2 && (
                    <View style={styles.moreNotesContainer}>
                      <Text style={[styles.moreNotes, { color: colors.textSecondary }]}>
                        +{notebookNotes.length - 2} more notes
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              {/* Empty state for notebooks with no notes */}
              {notebookNotes.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={24} color={colors.textSecondary} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    No notes yet
                  </Text>
                </View>
              )}
              
              {/* Long press hint */}
              <View style={styles.longPressHint}>
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                  Long press for more options
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: insets.bottom + 80 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 10 }}>📚</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
              {searchQuery ? 'No notebooks found' : 'No notebooks yet'}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', maxWidth: 260 }}>
              {searchQuery ? 'Try adjusting your search terms.' : 'Create your first notebook to organize your notes.'}
            </Text>
            {!searchQuery && (
              <Text style={{ color: colors.primary, fontSize: 15, marginTop: 18, fontWeight: '500' }}>
                Tip: Tap the + button to add a notebook.
              </Text>
            )}
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity 
        onPress={addNotebook} 
        style={[styles.floatingAddButton, { backgroundColor: '#4E71FF' }]}
      > 
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Create Notebook Modal */}
      <CreateNotebookModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onNotebookCreated={handleNotebookCreated}
      />

      {/* Notebook Action Modal */}
      <NotebookActionModal
        visible={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setSelectedNotebook(null);
        }}
        notebook={selectedNotebook}
        onRename={handleRenameNotebook}
        onShare={handleShareNotebook}
        onDeleteNotebookAndContents={handleDeleteNotebookAndContents}
        noteCount={selectedNotebook ? notes.filter(note => note.notebookId === selectedNotebook.id).length : 0}
      />
    </DarkGradientBackground>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 2,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 2,
    gap: 8,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notebookCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },

  notebookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  notebookInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notebookIcon: {
    marginRight: 8,
  },
  notebookTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  noteCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  notesPreviewContainer: {
    marginTop: 4,
  },
  notePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  firstNotePreview: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 12,
  },
  notePreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  noteIcon: {
    marginRight: 8,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  noteDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreNotesContainer: {
    paddingTop: 8,
    alignItems: 'center',
  },
  moreNotes: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  longPressHint: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  hintText: {
    fontSize: 11,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default NotebooksScreen
