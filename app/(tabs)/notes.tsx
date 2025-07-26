"use client";

import { getNotebooks } from "@/api/notebooksApi";
import { getNotes } from "@/api/notesApi";
import type { Note } from "@/api/types";
import FAB from "@/components/FAB";
import RichTextEditor from '@/components/RichTextEditor';
import { useTheme } from "@/contexts/ThemeContext";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const NotesScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [editorVisible, setEditorVisible] = useState(false);
  const [notebooks, setNotebooks] = useState<{ id: string; title: string }[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<{ id: string; title: string } | null>(null);
  const [notebookDropdownVisible, setNotebookDropdownVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [showInsertPanel, setShowInsertPanel] = useState(false);
  const [showFormatPanel, setShowFormatPanel] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const richTextEditorRef = useRef<any>(null);
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alignment: 'left' as 'left' | 'center' | 'right',
  });

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes();
        setNotes(data as Note[]);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

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
    if (editorVisible) fetchNotebooks();
  }, [editorVisible]);

  const openNote = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  const addNote = () => {
    router.push("../notes/new");
  };

  const openNoteEditor = () => {
    setEditorVisible(true);
    setNoteTitle("");
    setNoteContent("");
    setSelectedNotebook({ id: 'default', title: 'My Notebook' });
    setFormatState({
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      alignment: 'left',
    });
  };
  
  const closeNoteEditor = () => setEditorVisible(false);
  
  const saveNote = async () => {
    if (!noteTitle.trim()) {
      // Show error or alert
      return;
    }
    
    setSaving(true);
    try {
      // Create new note object
      const newNote = {
        id: Date.now().toString(), // Simple ID generation
        title: noteTitle.trim(),
        content: noteContent.trim(),
        notebookId: selectedNotebook?.id || 'default',
        notebookTitle: selectedNotebook?.title || 'My Notebook',
        date: new Date().toLocaleDateString(),
      };
      
      // Add to notes array
      setNotes(prevNotes => [newNote, ...prevNotes]);
      
      // Close editor
      closeNoteEditor();
      
      // Reset form
      setNoteTitle("");
      setNoteContent("");
      setSelectedNotebook({ id: 'default', title: 'My Notebook' });
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  // Formatting functions
  const toggleBold = () => {
    richTextEditorRef.current?.toggleBold();
    setFormatState(prev => ({ ...prev, bold: !prev.bold }));
  };

  const toggleItalic = () => {
    richTextEditorRef.current?.toggleItalic();
    setFormatState(prev => ({ ...prev, italic: !prev.italic }));
  };

  const toggleUnderline = () => {
    richTextEditorRef.current?.toggleUnderline();
    setFormatState(prev => ({ ...prev, underline: !prev.underline }));
  };

  const toggleStrikethrough = () => {
    richTextEditorRef.current?.toggleStrikethrough();
    setFormatState(prev => ({ ...prev, strikethrough: !prev.strikethrough }));
  };

  // Alignment functions
  const setAlignmentLeft = () => {
    richTextEditorRef.current?.setAlignment('left');
    setFormatState(prev => ({ ...prev, alignment: 'left' }));
  };

  const setAlignmentCenter = () => {
    richTextEditorRef.current?.setAlignment('center');
    setFormatState(prev => ({ ...prev, alignment: 'center' }));
  };

  const setAlignmentRight = () => {
    richTextEditorRef.current?.setAlignment('right');
    setFormatState(prev => ({ ...prev, alignment: 'right' }));
  };

  // Filter notes by search text
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchText.toLowerCase()) ||
    note.content.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}> 
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text, textAlign: 'left' }]}>Notes</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary, textAlign: 'left' }]}>Your recent notes and ideas</Text>
        </View>
      </View>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.accent }]}> 
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search notes..."
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
        />
      </View>
      {/* Total Notes Row */}
      <View style={styles.statsSimpleRow}>
        <Ionicons name="document-text-outline" size={20} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={{ color: colors.text, fontWeight: '600' }}>Total Notes: {filteredNotes.length}</Text>
      </View>
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openNote(item.id)}
            style={[
              styles.noteCard,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.noteTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>{item.title}</Text>
              <Text style={[styles.noteDate, { color: colors.textSecondary }]}>{item.date}</Text>
            </View>
            <Text style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.content}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: colors.textSecondary }}>
            No notes available.
          </Text>
        }
      />
      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <FAB onPress={openNoteEditor} icon="add" size={28} color={colors.success} />
      </View>
      {/* Full-Screen Note Editor Modal */}
      <Modal
        visible={editorVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeNoteEditor}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Top Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Pressable onPress={closeNoteEditor} hitSlop={10} style={{ padding: 6 }}>
              <Ionicons name="arrow-back" size={26} color={colors.text} />
            </Pressable>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
               <Pressable onPress={() => {}} hitSlop={10} style={{ padding: 6 }}>
                 <MaterialCommunityIcons name="undo-variant" size={24} color={colors.textSecondary} />
               </Pressable>
               <Pressable onPress={() => {}} hitSlop={10} style={{ padding: 6 }}>
                 <MaterialCommunityIcons name="redo-variant" size={24} color={colors.textSecondary} />
               </Pressable>
               <Pressable onPress={() => {}} hitSlop={10} style={{ padding: 6 }}>
                 <Feather name="share" size={22} color={colors.textSecondary} />
               </Pressable>
               <Pressable onPress={saveNote} hitSlop={10} style={{ padding: 6 }} disabled={saving}>
                 {saving ? (
                   <ActivityIndicator size="small" color={colors.primary} />
                 ) : (
                   <Ionicons name="checkmark" size={24} color={colors.primary} />
                 )}
               </Pressable>
               <Pressable onPress={() => {}} hitSlop={10} style={{ padding: 6 }}>
                 <Ionicons name="ellipsis-vertical" size={22} color={colors.textSecondary} />
               </Pressable>
             </View>
          </View>
          {/* Notebook Selector */}
          <Pressable
            onPress={() => setNotebookDropdownVisible(true)}
            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}
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
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }} onPress={() => setNotebookDropdownVisible(false)}>
              <View style={{ position: 'absolute', top: 70, left: 20, right: 20, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 8, elevation: 8 }}>
                {notebooks.map(nb => (
                  <Pressable
                    key={nb.id}
                    onPress={() => { setSelectedNotebook(nb); setNotebookDropdownVisible(false); }}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}
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
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: colors.text,
              marginTop: 18,
              marginHorizontal: 20,
              marginBottom: 4,
              paddingVertical: 0,
              borderBottomWidth: 0,
            }}
            placeholder="Title"
            placeholderTextColor={colors.textSecondary}
            maxLength={80}
            value={noteTitle}
            onChangeText={setNoteTitle}
            onFocus={() => setEditorFocused(true)}
            onBlur={() => setEditorFocused(false)}
          />
                     {/* Content Input */}
           <View style={{ marginHorizontal: 20, marginBottom: 8, minHeight: 120 }}>
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
          {/* Combined Insertion + Formatting Toolbar */}
          <View
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                minHeight: 48,
                zIndex: 20,
              },
              editorFocused
                ? {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }
                : {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '70%',
                  },
            ]}
          >
            {/* Insertion Toolbar (left, horizontal scroll) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingLeft: 10, paddingRight: 4 }}>
              <Pressable onPress={() => setShowInsertPanel(true)} style={{ marginRight: 10 }}>
                <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
              </Pressable>
              <Pressable style={{ marginRight: 10 }}><Feather name="check-square" size={20} color={colors.text} /></Pressable>
              <Pressable style={{ marginRight: 10 }}><Feather name="calendar" size={20} color={colors.text} /></Pressable>
              <Pressable style={{ marginRight: 10 }}><Feather name="camera" size={20} color={colors.text} /></Pressable>
              <Pressable style={{ marginRight: 10 }}><Feather name="image" size={20} color={colors.text} /></Pressable>
              <Pressable style={{ marginRight: 10 }}><Feather name="mic" size={20} color={colors.text} /></Pressable>
            </ScrollView>
            {/* Vertical Divider */}
            <View style={{ width: 1, height: 32, backgroundColor: colors.border, opacity: 0.4, marginHorizontal: 6 }} />
            {/* Formatting Toolbar (right, horizontal scroll) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingLeft: 4, paddingRight: 10 }}>
              <Pressable onPress={() => setShowFormatPanel(true)} style={{ marginRight: 10, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="text" size={22} color={colors.text} />
                <View style={{ width: 8 }} />
                <Ionicons name="chevron-down" size={14} color={colors.textSecondary} style={{ marginTop: 2 }} />
              </Pressable>
                             <Pressable onPress={toggleBold} style={{ marginRight: 10 }}>
                 <Feather name="bold" size={20} color={formatState.bold ? colors.primary : colors.text} />
               </Pressable>
               <Pressable onPress={toggleItalic} style={{ marginRight: 10 }}>
                 <Feather name="italic" size={20} color={formatState.italic ? colors.primary : colors.text} />
               </Pressable>
               <Pressable onPress={toggleUnderline} style={{ marginRight: 10 }}>
                 <Feather name="underline" size={20} color={formatState.underline ? colors.primary : colors.text} />
               </Pressable>
               <Pressable onPress={toggleStrikethrough} style={{ marginRight: 10 }}>
                 <MaterialCommunityIcons name="format-strikethrough-variant" size={20} color={formatState.strikethrough ? colors.primary : colors.text} />
               </Pressable>
                             <Pressable onPress={setAlignmentLeft} style={{ marginRight: 10 }}>
                 <MaterialCommunityIcons 
                   name="format-align-left" 
                   size={20} 
                   color={formatState.alignment === 'left' ? colors.primary : colors.text} 
                 />
               </Pressable>
               <Pressable onPress={setAlignmentCenter} style={{ marginRight: 10 }}>
                 <MaterialCommunityIcons 
                   name="format-align-center" 
                   size={20} 
                   color={formatState.alignment === 'center' ? colors.primary : colors.text} 
                 />
               </Pressable>
               <Pressable onPress={setAlignmentRight} style={{ marginRight: 10 }}>
                 <MaterialCommunityIcons 
                   name="format-align-right" 
                   size={20} 
                   color={formatState.alignment === 'right' ? colors.primary : colors.text} 
                 />
               </Pressable>
              <Pressable style={{ marginRight: 10 }}><Feather name="link" size={20} color={colors.text} /></Pressable>
            </ScrollView>
          </View>
          {/* Insert Panel Modal */}
          <Modal
            visible={showInsertPanel}
            transparent
            animationType="fade"
            onRequestClose={() => setShowInsertPanel(false)}
          >
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'flex-end' }} onPress={() => setShowInsertPanel(false)}>
              <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 24, minHeight: 260 }}>
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18, marginBottom: 18 }}>Insert</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="check-square" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Task</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="calendar" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Calendar</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="camera" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Camera</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <MaterialCommunityIcons name="table" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Table</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="check-square" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Checkbox</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="image" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Image</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="mic" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Audio</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="calendar" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Current Date</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <MaterialCommunityIcons name="function-variant" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Formula</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </Modal>
          {/* Format Panel Modal */}
          <Modal
            visible={showFormatPanel}
            transparent
            animationType="fade"
            onRequestClose={() => setShowFormatPanel(false)}
          >
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'flex-end' }} onPress={() => setShowFormatPanel(false)}>
              <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 24, minHeight: 180 }}>
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18, marginBottom: 18 }}>Formatting</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Ionicons name="text" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Font</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="type" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Font Type</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="bold" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Bold</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="italic" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Italic</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="underline" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Underline</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <MaterialCommunityIcons name="format-strikethrough-variant" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Strikethrough</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <MaterialCommunityIcons name="format-align-left" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Align Left</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <MaterialCommunityIcons name="format-align-center" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Align Center</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <MaterialCommunityIcons name="format-align-right" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Align Right</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="link" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Link</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="droplet" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Font Color</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 80, marginBottom: 18 }}>
                    <Feather name="type" size={28} color={colors.primary} />
                    <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>Font Size</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </Modal>
          {/* TODO: Rich text editor, toolbars, etc. */}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'left',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 10,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  noteCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  noteContent: {
    fontSize: 14,
    marginTop: 4,
  },
  noteDate: {
    fontSize: 12,
    marginLeft: 8,
  },
  fabContainer: {
    position: 'absolute',
    right: 28,
    bottom: 36,
    zIndex: 10,
  },
  // Add statsSimpleRow for the total notes row
  statsSimpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 0,
  },
});

export default NotesScreen;
