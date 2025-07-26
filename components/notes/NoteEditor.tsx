import { getNotebooks } from '@/api/notebooksApi';
import RichTextEditor from '@/components/RichTextEditor';
import { useTheme } from '@/contexts/ThemeContext';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import EditorToolbar from './EditorToolbar';
import FormatPanel from './FormatPanel';
import InsertPanel from './InsertPanel';

interface Notebook {
  id: string;
  title: string;
}

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
  saving,
  editingNote = null
}) => {
  const { colors } = useTheme();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);
  const [notebookDropdownVisible, setNotebookDropdownVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [showInsertPanel, setShowInsertPanel] = useState(false);
  const [showFormatPanel, setShowFormatPanel] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);
  const richTextEditorRef = useRef<any>(null);
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alignment: 'left' as 'left' | 'center' | 'right',
  });

  // Function to update format state from RichTextEditor
  const updateFormatState = () => {
    const currentFormatState = richTextEditorRef.current?.getFormatState?.();
    if (currentFormatState) {
      setFormatState(currentFormatState);
    }
  };

  // Fetch notebooks for selector
  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
        const data = await getNotebooks();
        setNotebooks([{ id: 'default', title: 'My Notebook' }, ...(data as any)]);
        setSelectedNotebook({ id: 'default', title: 'My Notebook' });
      } catch (error) {
        setNotebooks([{ id: 'default', title: 'My Notebook' }]);
        setSelectedNotebook({ id: 'default', title: 'My Notebook' });
      }
    };
    if (visible) fetchNotebooks();
  }, [visible]);

  // Reset form when editor opens or load existing note
  useEffect(() => {
    if (visible) {
      if (editingNote) {
        // Load existing note data
        setNoteTitle(editingNote.title);
        setNoteContent(editingNote.content);
        setSelectedNotebook({ 
          id: editingNote.notebookId, 
          title: editingNote.notebookTitle 
        });
      } else {
        // Reset for new note
        setNoteTitle("");
        setNoteContent("");
        setSelectedNotebook({ id: 'default', title: 'My Notebook' });
      }
      setFormatState({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        alignment: 'left',
      });
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
      date: editingNote?.date || new Date().toLocaleDateString(),
    };
    
    onSave(note);
  };

  // Formatting functions
  const toggleBold = () => {
    richTextEditorRef.current?.toggleBold();
    setTimeout(updateFormatState, 50);
  };

  const toggleItalic = () => {
    richTextEditorRef.current?.toggleItalic();
    setTimeout(updateFormatState, 50);
  };

  const toggleUnderline = () => {
    richTextEditorRef.current?.toggleUnderline();
    setTimeout(updateFormatState, 50);
  };

  const toggleStrikethrough = () => {
    richTextEditorRef.current?.toggleStrikethrough();
    setTimeout(updateFormatState, 50);
  };

  const setAlignmentLeft = () => {
    richTextEditorRef.current?.setAlignment('left');
    setTimeout(updateFormatState, 50);
  };

  const setAlignmentCenter = () => {
    richTextEditorRef.current?.setAlignment('center');
    setTimeout(updateFormatState, 50);
  };

  const setAlignmentRight = () => {
    richTextEditorRef.current?.setAlignment('right');
    setTimeout(updateFormatState, 50);
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
            <Pressable hitSlop={10} style={styles.topBarButton}>
              <Feather name="share" size={22} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={handleSave} hitSlop={10} style={styles.topBarButton} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="checkmark" size={24} color={colors.primary} />
              )}
            </Pressable>
            <Pressable hitSlop={10} style={styles.topBarButton}>
              <Ionicons name="ellipsis-vertical" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Notebook Selector */}
        <Pressable
          onPress={() => setNotebookDropdownVisible(true)}
          style={[styles.notebookSelector, { borderBottomColor: colors.border }]}
        >
          <Ionicons name="book-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.textSecondary, fontSize: 15, marginRight: 6 }}>
            {selectedNotebook ? selectedNotebook.title : 'My Notebook'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </Pressable>

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
              {notebooks.map(nb => (
                <Pressable
                  key={nb.id}
                  onPress={() => { setSelectedNotebook(nb); setNotebookDropdownVisible(false); }}
                  style={styles.dropdownItem}
                >
                  <Ionicons name="book-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={{ color: colors.text, fontSize: 15 }}>{nb.title}</Text>
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
             ref={richTextEditorRef}
             value={noteContent}
             onValueChange={setNoteContent}
             minHeight={120}
             placeholder="Start writing..."
             placeholderTextColor={colors.textSecondary}
             style={{ color: colors.text }}
             onFocus={() => setEditorFocused(true)}
             onBlur={() => setEditorFocused(false)}
           />
         </View>

        {/* Editor Toolbar */}
        <EditorToolbar
          formatState={formatState}
          onToggleBold={toggleBold}
          onToggleItalic={toggleItalic}
          onToggleUnderline={toggleUnderline}
          onToggleStrikethrough={toggleStrikethrough}
          onSetAlignmentLeft={setAlignmentLeft}
          onSetAlignmentCenter={setAlignmentCenter}
          onSetAlignmentRight={setAlignmentRight}
          onShowInsertPanel={() => setShowInsertPanel(true)}
          onShowFormatPanel={() => setShowFormatPanel(true)}
          editorFocused={editorFocused}
        />

        {/* Insert Panel */}
        <InsertPanel
          visible={showInsertPanel}
          onClose={() => setShowInsertPanel(false)}
        />

        {/* Format Panel */}
        <FormatPanel
          visible={showFormatPanel}
          onClose={() => setShowFormatPanel(false)}
        />
      </SafeAreaView>
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
    minHeight: 120,
  },
});

export default NoteEditor; 