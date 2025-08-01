import { getNotebooks } from '@/api/notebooksApi';
import type { Notebook } from '@/api/types';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useTheme } from '@/contexts/ThemeContext';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { RichToolbar, actions } from 'react-native-pell-rich-editor';
import ShareNoteModal from '../ShareNoteModal';


interface NoteEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (note: {
    id: string;
    title: string;
    content: string;
    notebookId: string;
    notebookTitle: string;
    date: string;
  }) => void;
  onDelete?: (noteId: string) => void;
  onNotebookChange?: (noteId: string, newNotebookId: string, newNotebookTitle: string) => void;
  saving: boolean;
  editingNote?: {
    id: string;
    title: string;
    content: string;
    notebookId: string;
    notebookTitle: string;
    date: string;
  } | null;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  visible, 
  onClose, 
  onSave, 
  onDelete,
  onNotebookChange,
  saving,
  editingNote = null
}) => {
  const { colors } = useTheme();
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [notebookDropdownVisible, setNotebookDropdownVisible] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  
  const pellEditorRef = useRef<any>(null);
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alignment: 'left' as 'left' | 'center' | 'right',
  });
  const [showFontFamilyPicker, setShowFontFamilyPicker] = useState(false);
  const [showInsertPanel, setShowInsertPanel] = useState(false);
  const [showFormatPanel, setShowFormatPanel] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Function to update format state from RichTextEditor
  const updateFormatState = () => {
    const currentFormatState = pellEditorRef.current?.getFormatState?.();
    if (currentFormatState) {
      setFormatState(currentFormatState);
    }
  };

  // Load notebooks when editor becomes visible
  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
        const data = await getNotebooks();
        console.log('NoteEditor - Loaded notebooks:', data); // Debug log
        
        // Filter out any existing "default" notebook from API data to avoid duplicates
        const filteredData = data.filter(nb => nb.id !== 'default');
        
        // Add "My Notebook" as the default option for unassigned notes
        const defaultNotebook = { id: 'default', title: 'My Notebook' };
        const allNotebooks = [defaultNotebook, ...filteredData];
        console.log('NoteEditor - All notebooks including default:', allNotebooks); // Debug log
        setNotebooks(allNotebooks);
        
        // Handle form initialization based on whether we're editing or creating
        if (editingNote) {
          console.log('NoteEditor - Editing note:', editingNote); // Debug log
          // Load existing note data
          setNoteTitle(editingNote.title);
          setNoteContent(editingNote.content);
          
          // Set selected notebook based on editing note
          if (editingNote.notebookId !== 'default') {
            const existingNotebook = allNotebooks.find(nb => nb.id === editingNote.notebookId);
            console.log('NoteEditor - Found existing notebook:', existingNotebook); // Debug log
            if (existingNotebook) {
              setSelectedNotebook(existingNotebook);
            } else {
              setSelectedNotebook(defaultNotebook);
            }
          } else {
            setSelectedNotebook(defaultNotebook);
          }
        } else {
          console.log('NoteEditor - Creating new note, defaulting to My Notebook'); // Debug log
          // Reset for new note - always default to "My Notebook"
          setNoteTitle("");
          setNoteContent("");
          setSelectedNotebook(defaultNotebook);
        }
        
        setFormatState({
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          alignment: 'left',
        });
      } catch (error) {
        console.error('Error fetching notebooks:', error);
        // Fallback to just the default notebook
        const defaultNotebook = { id: 'default', title: 'My Notebook' };
        setNotebooks([defaultNotebook]);
        
        if (editingNote) {
          setNoteTitle(editingNote.title);
          setNoteContent(editingNote.content);
          setSelectedNotebook({ 
            id: editingNote.notebookId, 
            title: editingNote.notebookTitle 
          });
        } else {
          setNoteTitle("");
          setNoteContent("");
          setSelectedNotebook(defaultNotebook);
        }
        
        setFormatState({
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          alignment: 'left',
        });
      }
    };
    
    if (visible) {
      fetchNotebooks();
    }
  }, [visible, editingNote]);

  // Update format state when editor becomes visible
  useEffect(() => {
    if (visible) {
      setTimeout(updateFormatState, 100);
    }
  }, [visible]);

  const handleSave = () => {
    if (!noteTitle.trim()) {
      return;
    }
    
    const note = {
      id: editingNote?.id || Date.now().toString(),
      title: noteTitle.trim(),
      content: noteContent.trim(),
      notebookId: selectedNotebook?.id || 'default',
      notebookTitle: selectedNotebook?.title || 'My Notebook',
      date: editingNote?.date || new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
    };
    
    console.log('NoteEditor - Saving note with notebookId:', note.notebookId, 'selectedNotebook:', selectedNotebook); // Debug log
    onSave(note);
  };

  // Formatting functions
  const toggleBold = () => {
    pellEditorRef.current?.toggleBold();
    pellEditorRef.current?.toggleBold();
    setTimeout(updateFormatState, 50);
  };

  const toggleItalic = () => {
    pellEditorRef.current?.toggleItalic();
    pellEditorRef.current?.toggleItalic();
    setTimeout(updateFormatState, 50);
  };

  const toggleUnderline = () => {
    pellEditorRef.current?.toggleUnderline();
    pellEditorRef.current?.toggleUnderline();
    setTimeout(updateFormatState, 50);
  };

  const toggleStrikethrough = () => {
    pellEditorRef.current?.toggleStrikethrough();
    pellEditorRef.current?.toggleStrikethrough();
    setTimeout(updateFormatState, 50);
  };

  const setAlignmentLeft = () => {
    pellEditorRef.current?.setAlignment('left');
    pellEditorRef.current?.setAlignment('left');
    setTimeout(updateFormatState, 50);
  };

  const setAlignmentCenter = () => {
    pellEditorRef.current?.setAlignment('center');
    pellEditorRef.current?.setAlignment('center');
    setTimeout(updateFormatState, 50);
  };

  const setAlignmentRight = () => {
    pellEditorRef.current?.setAlignment('right');
    pellEditorRef.current?.setAlignment('right');
    setTimeout(updateFormatState, 50);
  };

  // Search functionality
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }
    
    // Simple text search in note content (case insensitive)
    const content = noteContent.toLowerCase();
    const searchTerm = text.toLowerCase();
    const results: number[] = [];
    let index = content.indexOf(searchTerm);
    
    while (index !== -1) {
      results.push(index);
      index = content.indexOf(searchTerm, index + 1);
    }
    
    setSearchResults(results);
    setCurrentSearchIndex(0);
  };

  const handleNextSearch = () => {
    if (searchResults.length > 0) {
      setCurrentSearchIndex((prev) => (prev + 1) % searchResults.length);
    }
  };

  const handlePreviousSearch = () => {
    if (searchResults.length > 0) {
      setCurrentSearchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    }
  };

  const handleDeleteNote = () => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            if (editingNote && onDelete) {
              onDelete(editingNote.id);
            }
            onClose();
          }
        }
      ]
    );
  };

  const handleShare = () => {
    setShareModalVisible(true);
  };

  const closeShareModal = () => {
    setShareModalVisible(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Top Bar */}
        {showSearchBar ? (
          // Search Bar
          <View style={[styles.searchBar, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowSearchBar(false)} hitSlop={10} style={styles.searchBarButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            
            <View style={styles.searchInputContainer}>
              <TextInput
                style={[styles.searchInput, { color: colors.text, backgroundColor: colors.surface }]}
                placeholder="Find in note"
                placeholderTextColor={colors.textSecondary}
                value={searchText}
                onChangeText={handleSearch}
                autoFocus
              />
            </View>
            
            <View style={styles.searchActions}>
              {searchResults.length > 0 && (
                <>
                  <Text style={[styles.searchResultsText, { color: colors.textSecondary }]}>
                    {currentSearchIndex + 1}/{searchResults.length}
                  </Text>
                  <Pressable onPress={handlePreviousSearch} hitSlop={10} style={styles.searchBarButton}>
                    <Ionicons name="chevron-up" size={20} color={colors.primary} />
                  </Pressable>
                  <Pressable onPress={handleNextSearch} hitSlop={10} style={styles.searchBarButton}>
                    <Ionicons name="chevron-down" size={20} color={colors.primary} />
                  </Pressable>
                </>
              )}
              <Pressable onPress={() => setShowSearchBar(false)} hitSlop={10} style={styles.searchBarButton}>
                <Text style={[styles.cancelButton, { color: colors.primary }]}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          // Normal Top Bar
          <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
            <Pressable onPress={onClose} hitSlop={10} style={styles.topBarButton}>
              <Ionicons name="arrow-back" size={26} color={colors.text} />
            </Pressable>
            
            <View style={styles.topBarActions}>
              <Pressable hitSlop={10} style={styles.topBarButton}>
                <MaterialCommunityIcons name="undo-variant" size={24} color={colors.textSecondary} />
              </Pressable>
              <Pressable hitSlop={10} style={styles.topBarButton}>
                <MaterialCommunityIcons name="redo-variant" size={24} color={colors.textSecondary} />
              </Pressable>
              <Pressable onPress={handleShare} hitSlop={10} style={styles.topBarButton}>
                <Ionicons name="share-outline" size={22} color={colors.primary} />
              </Pressable>
              <Pressable onPress={handleSave} hitSlop={10} style={styles.topBarButton} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="checkmark" size={24} color={colors.primary} />
                )}
              </Pressable>
              <Pressable onPress={() => setShowOptionsMenu(true)} hitSlop={10} style={styles.topBarButton}>
                <Ionicons name="ellipsis-vertical" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Options Menu Modal */}
        <Modal
          visible={showOptionsMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowOptionsMenu(false)}
        >
          <Pressable 
            style={styles.dropdownOverlay} 
            onPress={() => setShowOptionsMenu(false)}
          >
            <View style={[styles.optionsMenu, { backgroundColor: colors.surface }]}>
              <Pressable
                onPress={() => {
                  setShowOptionsMenu(false);
                  setShowSearchBar(true);
                }}
                style={styles.optionsMenuItem}
              >
                <Ionicons name="search" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                <Text style={{ color: colors.text, fontSize: 16 }}>Find in note</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  setShowOptionsMenu(false);
                  handleDeleteNote();
                }}
                style={styles.optionsMenuItem}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} style={{ marginRight: 12 }} />
                <Text style={{ color: colors.error, fontSize: 16 }}>Delete note</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Notebook Selector */}
        <View style={styles.notebookSelectorContainer}>
          <Pressable
            onPress={() => setNotebookDropdownVisible(true)}
            style={[styles.notebookSelector, { borderBottomColor: colors.border }]}
          >
            <Ionicons 
              name="book-outline" 
              size={18} 
              color={selectedNotebook ? colors.primary : colors.textSecondary} 
              style={{ marginRight: 8 }} 
            />
            <Text style={{ 
              color: selectedNotebook ? colors.primary : colors.textSecondary, 
              fontSize: 15, 
              marginRight: 6,
              fontWeight: selectedNotebook ? '600' : '400'
            }}>
              {selectedNotebook ? selectedNotebook.title : 'My Notebook'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={selectedNotebook ? colors.primary : colors.textSecondary} />
          </Pressable>
          <TouchableOpacity
            onPress={() => {
              const fetchNotebooks = async () => {
                try {
                  const data = await getNotebooks();
                  const filteredData = data.filter(nb => nb.id !== 'default');
                  const defaultNotebook = { id: 'default', title: 'My Notebook' };
                  const allNotebooks = [defaultNotebook, ...filteredData];
                  setNotebooks(allNotebooks);
                } catch (error) {
                  console.error('Error refreshing notebooks:', error);
                }
              };
              fetchNotebooks();
            }}
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Notebook Dropdown Modal */}
        <Modal
          visible={notebookDropdownVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setNotebookDropdownVisible(false)}
        >
          <Pressable 
            style={styles.dropdownOverlay} 
            onPress={() => setNotebookDropdownVisible(false)}
          >
            <View style={[styles.dropdown, { backgroundColor: colors.surface }]}>
              {/* Refresh option at the top */}
              <Pressable
                onPress={() => {
                  const fetchNotebooks = async () => {
                    try {
                      const data = await getNotebooks();
                      const filteredData = data.filter(nb => nb.id !== 'default');
                      const defaultNotebook = { id: 'default', title: 'My Notebook' };
                      const allNotebooks = [defaultNotebook, ...filteredData];
                      setNotebooks(allNotebooks);
                    } catch (error) {
                      console.error('Error refreshing notebooks:', error);
                    }
                  };
                  fetchNotebooks();
                  setNotebookDropdownVisible(false);
                }}
                style={[styles.dropdownItem, styles.refreshItem]}
              >
                <Ionicons name="refresh" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>Refresh Notebooks</Text>
              </Pressable>
              
              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              {/* Notebook options */}
              {notebooks.map(nb => (
                <Pressable
                  key={nb.id}
                  onPress={() => { 
                    console.log('NoteEditor - Selected notebook:', nb); // Debug log
                    setSelectedNotebook(nb); 
                    setNotebookDropdownVisible(false);
                    
                    // Instant reflection - call callback immediately
                    if (onNotebookChange && editingNote) {
                      console.log('NoteEditor - Calling onNotebookChange with:', {
                        noteId: editingNote.id,
                        newNotebookId: nb.id,
                        newNotebookTitle: nb.title
                      });
                      onNotebookChange(editingNote.id, nb.id, nb.title);
                    }
                  }}
                  style={[
                    styles.dropdownItem,
                    selectedNotebook?.id === nb.id && { backgroundColor: colors.primary + '20' }
                  ]}
                >
                  <Ionicons 
                    name={selectedNotebook?.id === nb.id ? "book" : "book-outline"} 
                    size={18} 
                    color={selectedNotebook?.id === nb.id ? colors.primary : colors.text} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={{ 
                    color: selectedNotebook?.id === nb.id ? colors.primary : colors.text, 
                    fontSize: 15,
                    fontWeight: selectedNotebook?.id === nb.id ? '600' : '400'
                  }}>
                    {nb.title}
                  </Text>
                  {selectedNotebook?.id === nb.id && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} style={{ marginLeft: 'auto' }} />
                  )}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>

        {/* Title Input */}
        <TextInput
          style={[styles.titleInput, { color: colors.text }]}
          placeholder="Title"
          placeholderTextColor={colors.textSecondary}
          maxLength={80}
          value={noteTitle}
          onChangeText={setNoteTitle}
          onFocus={() => setEditorFocused(true)}
          onBlur={() => setEditorFocused(false)}
        />

        {/* Content Input */}
        <View style={styles.contentContainer}>
          <RichTextEditor
            pellEditorRef={pellEditorRef}
            value={noteContent}
            onValueChange={setNoteContent}
            placeholder="Start writing..."
            placeholderTextColor={colors.textSecondary}
            style={{ flex: 1, color: colors.text }} 
            onFocus={() => setEditorFocused(true)}
            onBlur={() => setEditorFocused(false)}
          />
        </View>

        {/* Combined Formatting and Insertion Toolbar, each half scrollable */}
        <View style={styles.toolbarContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 2, paddingHorizontal: 2 }}>
            <View style={{ flex: 1 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <RichToolbar
                  editor={pellEditorRef}
                  actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.setStrikethrough, actions.alignLeft, actions.alignCenter, actions.alignRight]}
                  style={{ backgroundColor: 'transparent', borderRadius: 12 }}
                  iconTint={colors.text}
                  selectedIconTint={colors.primary}
                  selectedButtonStyle={{ backgroundColor: 'transparent' }}
                />
              </ScrollView>
            </View>
            <View style={{ flex: 1 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable onPress={() => {
                  pellEditorRef.current?.insertHTML?.('<input type="checkbox" style="width:18px;height:18px;vertical-align:middle;margin-right:4px;" />');
                }} style={styles.insertButton}><Feather name="check-square" size={22} color={colors.primary} /></Pressable>
                <Pressable onPress={() => {}} style={styles.insertButton}><Feather name="calendar" size={22} color={colors.primary} /></Pressable>
                <Pressable onPress={() => {}} style={styles.insertButton}><Feather name="camera" size={22} color={colors.primary} /></Pressable>
                <Pressable onPress={() => {}} style={styles.insertButton}><MaterialCommunityIcons name="table" size={22} color={colors.primary} /></Pressable>
                <Pressable onPress={() => {}} style={styles.insertButton}><Feather name="check-square" size={22} color={colors.primary} /></Pressable>
                <Pressable onPress={() => {}} style={styles.insertButton}><Feather name="image" size={22} color={colors.primary} /></Pressable>
                <Pressable onPress={() => {}} style={styles.insertButton}><Feather name="mic" size={22} color={colors.primary} /></Pressable>
                <Pressable onPress={() => {}} style={styles.insertButton}><Feather name="calendar" size={22} color={colors.primary} /></Pressable>
                <Pressable onPress={() => {}} style={styles.insertButton}><MaterialCommunityIcons name="function-variant" size={22} color={colors.primary} /></Pressable>
              </ScrollView>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Share Note Modal */}
      <ShareNoteModal
        visible={shareModalVisible}
        onClose={closeShareModal}
        note={editingNote ? {
          id: editingNote.id,
          title: editingNote.title,
          content: editingNote.content,
        } : null}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBarButton: {
    padding: 6,
  },
  notebookSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  refreshItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  notebookSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  refreshButton: {
    padding: 6,
    borderRadius: 8,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 18,
    marginHorizontal: 20,
    marginBottom: 4,
    paddingVertical: 0,
    borderBottomWidth: 0,
  },
  contentContainer: {
    marginHorizontal: 20,
    marginBottom: 8,
    flex: 1, // Make the container expand to fill available space
  },
  toolbarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: undefined, // will be set by RichToolbar or parent
    paddingHorizontal: 10,
    paddingBottom: 10,
    zIndex: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    minHeight: 48,
  },
  insertButton: {
    padding: 6,
    marginHorizontal: 1,
    borderRadius: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  searchBarButton: {
    padding: 6,
  },
  searchInputContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  searchInput: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  searchResultsText: {
    fontSize: 14,
    marginRight: 10,
  },
  cancelButton: {
    fontSize: 16,
  },
  optionsMenu: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 8,
  },
  optionsMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

export default NoteEditor; 