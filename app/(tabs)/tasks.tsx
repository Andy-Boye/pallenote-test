"use client";

import FAB from "@/components/FAB";
import TaskItem from "@/components/TaskItem";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DarkGradientBackground from '../../components/DarkGradientBackground';

type Task = {
  id: string;
  title: string;
  dueDate?: string; // ISO string or undefined
  completed: boolean;
};

const TasksScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [rescheduleTaskId, setRescheduleTaskId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState<Date | null>(null);
  const [showRescheduleDatePicker, setShowRescheduleDatePicker] = useState(false);
  const [showRescheduleTimePicker, setShowRescheduleTimePicker] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDate, setNewTaskDate] = useState<Date | null>(null);
  const [newTaskTime, setNewTaskTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editTaskDate, setEditTaskDate] = useState<Date | null>(null);
  const [editTaskTime, setEditTaskTime] = useState<Date | null>(null);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);
  const insets = useSafeAreaInsets();

  // Add state for multi-select mode and selected tasks
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data as Task[]);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        Alert.alert("Error", "Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskPress = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setEditTaskId(task.id);
    setEditTaskName(task.title);
    setEditTaskDate(task.dueDate ? new Date(task.dueDate) : null);
    setEditTaskTime(task.dueDate ? new Date(task.dueDate) : null);
    setShowEditDatePicker(false);
    setShowEditTimePicker(false);
    setEditModalVisible(true);
  };

  const handleToggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Utility to format due date
  function formatDueDate(dueDateISO: string | undefined): string | undefined {
    if (!dueDateISO) return undefined;
    const now = new Date();
    const due = new Date(dueDateISO);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffMs = dueDay.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const timeStr = due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 0) return `Due: Today (${timeStr})`;
    if (diffDays === 1) return `Due: Tomorrow (${timeStr})`;
    if (diffDays > 1 && diffDays <= 7) {
      const weekday = due.toLocaleDateString(undefined, { weekday: 'long' });
      return `Due: ${weekday} (${timeStr})`;
    }
    if (diffDays > 7) {
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;
      return `Due: ${weeks} Week${weeks > 1 ? 's' : ''}${days ? ` ${days} Day${days > 1 ? 's' : ''}` : ''}`;
    }
    return undefined;
  }

  const handleDueDatePress = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setRescheduleTaskId(task.id);
    setRescheduleDate(task.dueDate ? new Date(task.dueDate) : null);
    setRescheduleTime(task.dueDate ? new Date(task.dueDate) : null);
    setShowRescheduleDatePicker(false);
    setShowRescheduleTimePicker(false);
    setRescheduleModalVisible(true);
  };

  const handleRescheduleDueDate = () => {
    let dueDate: string | undefined = undefined;
    if (rescheduleDate && rescheduleTime) {
      const date = new Date(rescheduleDate);
      date.setHours(rescheduleTime.getHours());
      date.setMinutes(rescheduleTime.getMinutes());
      dueDate = date.toISOString();
    }
    setTasks(prev => prev.map(t => t.id === rescheduleTaskId ? { ...t, dueDate } : t));
    setRescheduleModalVisible(false);
  };
  const handleRemoveSchedule = () => {
    setTasks(prev => prev.map(t => t.id === rescheduleTaskId ? { ...t, dueDate: undefined } : t));
    setRescheduleModalVisible(false);
    Alert.alert('Removed', 'Schedule removed from task.');
  };

  const handleTaskLongPress = (id: string) => {
    setSelectedTaskId(id);
    setActionModalVisible(true);
  };

  const handleAction = (action: string) => {
    setActionModalVisible(false);
    if (!selectedTaskId) return;
    switch (action) {
      case 'rename': {
        const task = tasks.find(t => t.id === selectedTaskId);
        setRenameValue(task?.title || "");
        setRenameModalVisible(true);
        break;
      }
      case 'reschedule': {
        const task = tasks.find(t => t.id === selectedTaskId);
        setRescheduleValue(task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "");
        setRescheduleModalVisible(true);
        break;
      }
      case 'remove_schedule': {
        setTasks(prev => prev.map(t => t.id === selectedTaskId ? { ...t, dueDate: undefined } : t));
        Alert.alert('Removed', 'Schedule removed from task.');
        break;
      }
      case 'delete': {
        setTasks(prev => prev.filter(t => t.id !== selectedTaskId));
        Alert.alert('Deleted', 'Task deleted successfully.');
        break;
      }
    }
  };

  // Handler to enter multi-select mode
  const handleSelectMode = () => {
    setMultiSelectMode(true);
    setActionModalVisible(false);
    if (selectedTaskId) setSelectedTasks([selectedTaskId]);
  };

  // Handler to toggle selection of a task
  const handleToggleSelectTask = (id: string) => {
    setSelectedTasks(prev => prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]);
  };

  // Handler to exit multi-select mode
  const handleExitMultiSelect = () => {
    setMultiSelectMode(false);
    setSelectedTasks([]);
  };

  // Handler to delete selected tasks
  const handleDeleteSelectedTasks = () => {
    setTasks(prev => prev.filter(t => !selectedTasks.includes(t.id)));
    setMultiSelectMode(false);
    setSelectedTasks([]);
    Alert.alert('Deleted', 'Selected tasks deleted successfully.');
  };

  const handleRenameSave = () => {
    setTasks(prev => prev.map(t => t.id === selectedTaskId ? { ...t, title: renameValue } : t));
    setRenameModalVisible(false);
    Alert.alert('Renamed', 'Task renamed successfully.');
  };

  const handleRescheduleSave = () => {
    setTasks(prev => prev.map(t => t.id === selectedTaskId ? { ...t, dueDate: rescheduleValue } : t));
    setRescheduleModalVisible(false);
    Alert.alert('Rescheduled', 'Task rescheduled successfully.');
  };

  const openAddModal = () => {
    setNewTaskName("");
    setNewTaskDate(null);
    setNewTaskTime(null);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setAddModalVisible(true);
  };

  const handleAddTask = () => {
    if (!newTaskName.trim()) {
      Alert.alert("Validation", "Task name is required.");
      return;
    }
    let dueDate: string | undefined = undefined;
    if (newTaskDate && newTaskTime) {
      const date = new Date(newTaskDate);
      date.setHours(newTaskTime.getHours());
      date.setMinutes(newTaskTime.getMinutes());
      dueDate = date.toISOString();
    }
    setTasks(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newTaskName,
        dueDate,
        completed: false,
      },
    ]);
    setAddModalVisible(false);
  };

  const handleEditTask = () => {
    if (!editTaskName.trim()) {
      Alert.alert("Validation", "Task name is required.");
      return;
    }
    let dueDate: string | undefined = undefined;
    if (editTaskDate && editTaskTime) {
      const date = new Date(editTaskDate);
      date.setHours(editTaskTime.getHours());
      date.setMinutes(editTaskTime.getMinutes());
      dueDate = date.toISOString();
    }
    setTasks(prev => prev.map(t => t.id === editTaskId ? { ...t, title: editTaskName, dueDate } : t));
    setEditModalVisible(false);
  };

  const handleDeleteTaskFromEdit = () => {
    setTasks(prev => prev.filter(t => t.id !== editTaskId));
    setEditModalVisible(false);
    Alert.alert('Deleted', 'Task deleted successfully.');
  };

  if (loading) {
    return (
      <DarkGradientBackground>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </DarkGradientBackground>
    );
  }

  return (
    <DarkGradientBackground>
      {/* Modern Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text, textAlign: 'left', flex: 1 }]}>My Tasks</Text>
        <Pressable onPress={() => {/* handle notification press */}} hitSlop={10} style={{ marginLeft: 10 }}>
          <Ionicons name="notifications-outline" size={26} color={colors.primary} />
        </Pressable>
      </View>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.accent, marginBottom: 18, marginTop: 2 }]}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search tasks..."
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
        />
      </View>
      {/* Replace the quick stats row with a simple row of icons and text */}
      <View style={styles.statsSimpleRow}>
        <Ionicons name="checkmark-done-circle" size={20} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={{ color: colors.text, fontWeight: '600', marginRight: 18 }}>Completed: {completedTasks}</Text>
        <Ionicons name="time" size={20} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={{ color: colors.text, fontWeight: '600' }}>Pending: {pendingTasks}</Text>
      </View>
      {/* Task List */}
      <FlatList
        data={tasks.filter(t => t.title.toLowerCase().includes(searchText.toLowerCase()))}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            id={item.id}
            title={item.title}
            completed={item.completed}
            scheduled={!!item.dueDate}
            dueDate={formatDueDate(item.dueDate)}
            onToggle={handleToggle}
            onPress={multiSelectMode ? handleToggleSelectTask : handleTaskPress}
            onDueDatePress={handleDueDatePress}
            onLongPress={multiSelectMode ? handleToggleSelectTask : handleTaskLongPress}
            selected={multiSelectMode && selectedTasks.includes(item.id)}
            multiSelectMode={multiSelectMode}
          />
        )}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 10 }}>✅</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>No tasks yet</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', maxWidth: 260 }}>
              You're all caught up! Add a new task to get started.
            </Text>
            <Text style={{ color: colors.primary, fontSize: 15, marginTop: 18, fontWeight: '500' }}>
              Tip: Tap the + button to add a task.
            </Text>
          </View>
        }
      />
      {/* Show a delete bar at the bottom when in multi-select mode */}
      {multiSelectMode && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{selectedTasks.length} selected</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={handleExitMultiSelect} style={{ marginRight: 24 }}>
              <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={handleDeleteSelectedTasks} disabled={selectedTasks.length === 0}>
              <Ionicons name="trash" size={28} color={selectedTasks.length === 0 ? colors.textSecondary : colors.error} />
            </Pressable>
          </View>
        </View>
      )}
      {/* Floating Action Button */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <FAB onPress={openAddModal} />
      </View>
      {/* Action Sheet Modal */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setActionModalVisible(false)}>
          <View style={[styles.actionSheet, { backgroundColor: colors.surface }]}
            pointerEvents="box-none">
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text, marginBottom: 12 }}>Task Options</Text>
            <Pressable style={styles.actionBtn} onPress={handleSelectMode}>
              <Text style={[styles.actionText, { color: colors.text }]}>Select</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => handleAction('rename')}>
              <Text style={[styles.actionText, { color: colors.text }]}>Rename Title</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => handleAction('reschedule')}>
              <Text style={[styles.actionText, { color: colors.text }]}>Reschedule Task</Text>
            </Pressable>
            {(() => {
              const task = tasks.find(t => t.id === selectedTaskId);
              if (task && task.dueDate) {
                return (
                  <Pressable style={styles.actionBtn} onPress={() => handleAction('remove_schedule')}>
                    <Text style={[styles.actionText, { color: colors.text }]}>Remove Schedule</Text>
                  </Pressable>
                );
              }
              return null;
            })()}
            <Pressable style={styles.actionBtn} onPress={() => handleAction('delete')}>
              <Text style={[styles.actionText, { color: colors.error }]}>Delete Task</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, { marginTop: 8 }]} onPress={() => setActionModalVisible(false)}>
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      {/* Rename Modal */}
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setRenameModalVisible(false)}>
          <View style={[styles.actionSheet, { backgroundColor: colors.surface }]}
            pointerEvents="box-none">
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text, marginBottom: 12 }}>Rename Task</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Task title"
              placeholderTextColor={colors.textSecondary}
              maxLength={60}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
              <Pressable onPress={() => setRenameModalVisible(false)} style={{ marginRight: 18 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleRenameSave}>
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
      {/* Reschedule Modal */}
      <Modal
        visible={rescheduleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRescheduleModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setRescheduleModalVisible(false)}>
          <View style={[styles.actionSheet, { backgroundColor: colors.surface }]}
            pointerEvents="box-none">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.text }}>Reschedule Task</Text>
              <Pressable onPress={handleRemoveSchedule} hitSlop={10} style={{ marginLeft: 8 }}>
                <Ionicons name="trash" size={22} color={colors.error} />
              </Pressable>
            </View>
            {/* Date Picker */}
            <Pressable
              style={[styles.pickerBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => setShowRescheduleDatePicker(true)}
            >
              <Text style={{ color: colors.text, fontSize: 16 }}>
                {rescheduleDate ? `Date: ${rescheduleDate.toLocaleDateString()}` : 'Pick Date'}
              </Text>
            </Pressable>
            {showRescheduleDatePicker && !showRescheduleTimePicker && (
              <DateTimePicker
                value={rescheduleDate || today}
                mode="date"
                display={Platform.OS === 'android' ? 'calendar' : (Platform.OS === 'ios' ? 'inline' : 'default')}
                onChange={(event, selectedDate) => {
                  setShowRescheduleDatePicker(false);
                  if (selectedDate) setRescheduleDate(selectedDate);
                  else console.log('Reschedule date picker cancelled or error');
                }}
                minimumDate={today}
                onError={err => console.error('DateTimePicker error:', err)}
              />
            )}
            {/* Time Picker */}
            <Pressable
              style={[styles.pickerBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => setShowRescheduleTimePicker(true)}
            >
              <Text style={{ color: colors.text, fontSize: 16 }}>
                {rescheduleTime ? `Time: ${rescheduleTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Pick Time'}
              </Text>
            </Pressable>
            {showRescheduleTimePicker && !showRescheduleDatePicker && (
              <DateTimePicker
                value={rescheduleTime || new Date()}
                mode="time"
                display={Platform.OS === 'android' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowRescheduleTimePicker(false);
                  if (selectedTime) setRescheduleTime(selectedTime);
                  else console.log('Reschedule time picker cancelled or error');
                }}
                onError={err => console.error('DateTimePicker error:', err)}
              />
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
              <Pressable onPress={() => setRescheduleModalVisible(false)} style={{ marginRight: 18 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleRescheduleDueDate}>
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
      {/* Add Task Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 18, width: '90%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 12 }}>Add Task</Text>
            <TextInput
              placeholder="Task Title"
              value={newTaskName}
              onChangeText={setNewTaskName}
              style={{ borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 10, marginBottom: 14, color: colors.text }}
              placeholderTextColor={colors.textSecondary}
              maxLength={60}
            />
            <Pressable onPress={() => setShowDatePicker(true)} style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Date: {newTaskDate ? newTaskDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
              </Text>
            </Pressable>
            <Pressable onPress={() => setShowTimePicker(true)} style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Time: {newTaskTime ? newTaskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
            </Pressable>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
              <Pressable onPress={() => setAddModalVisible(false)} style={{ marginRight: 18 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddTask}>
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>Add</Text>
              </Pressable>
            </View>
            {/* Date Picker */}
            {showDatePicker && (
              <>
                {Platform.OS === 'android' ? (
                  <Pressable onPress={() => setShowDatePicker(false)}><Text style={{ color: colors.primary }}>Pick Date</Text></Pressable>
                ) : null}
                <DateTimePicker
                  value={newTaskDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setNewTaskDate(date);
                  }}
                />
              </>
            )}
            {/* Time Picker */}
            {showTimePicker && (
              <>
                {Platform.OS === 'android' ? (
                  <Pressable onPress={() => setShowTimePicker(false)}><Text style={{ color: colors.primary }}>Pick Time</Text></Pressable>
                ) : null}
                <DateTimePicker
                  value={newTaskTime || new Date()}
                  mode="time"
                  display="clock"
                  onChange={(event, date) => {
                    setShowTimePicker(false);
                    if (date) setNewTaskTime(date);
                  }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
      {/* Edit Task Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 18, width: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 20, color: colors.text }}>Edit Task</Text>
              <Pressable onPress={handleDeleteTaskFromEdit} hitSlop={10} style={{ marginLeft: 8 }}>
                <Ionicons name="trash" size={22} color={colors.error} />
              </Pressable>
            </View>
            <TextInput
              placeholder="Task Title"
              value={editTaskName}
              onChangeText={setEditTaskName}
              style={{ borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 10, marginBottom: 14, color: colors.text }}
              placeholderTextColor={colors.textSecondary}
              maxLength={60}
            />
            <Pressable onPress={() => setShowEditDatePicker(true)} style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Date: {editTaskDate ? editTaskDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
              </Text>
            </Pressable>
            <Pressable onPress={() => setShowEditTimePicker(true)} style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Time: {editTaskTime ? editTaskTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
            </Pressable>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
              <Pressable onPress={() => setEditModalVisible(false)} style={{ marginRight: 18 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleEditTask}>
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>Save</Text>
              </Pressable>
            </View>
            {/* Date Picker */}
            {showEditDatePicker && !showEditTimePicker && (
              <DateTimePicker
                value={editTaskDate || today}
                mode="date"
                display={Platform.OS === 'android' ? 'calendar' : (Platform.OS === 'ios' ? 'inline' : 'default')}
                onChange={(event, selectedDate) => {
                  setShowEditDatePicker(false);
                  if (selectedDate) setEditTaskDate(selectedDate);
                  else console.log('Edit date picker cancelled or error');
                }}
                minimumDate={today}
                onError={err => console.error('DateTimePicker error:', err)}
              />
            )}
            {/* Time Picker */}
            {showEditTimePicker && !showEditDatePicker && (
              <DateTimePicker
                value={editTaskTime || new Date()}
                mode="time"
                display={Platform.OS === 'android' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowEditTimePicker(false);
                  if (selectedTime) setEditTaskTime(selectedTime);
                  else console.log('Edit time picker cancelled or error');
                }}
                onError={err => console.error('DateTimePicker error:', err)}
              />
            )}
          </View>
        </View>
      </Modal>
      {/* Reschedule Task Modal */}
      <Modal
        visible={rescheduleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRescheduleModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: colors.surface, padding: 24, borderRadius: 18, width: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 20, color: colors.text }}>Reschedule Task</Text>
              <Pressable onPress={handleRemoveSchedule} hitSlop={10} style={{ marginLeft: 8 }}>
                <Ionicons name="trash" size={22} color={colors.error} />
              </Pressable>
            </View>
            <Pressable onPress={() => setShowRescheduleDatePicker(true)} style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Date: {rescheduleDate ? rescheduleDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}
              </Text>
            </Pressable>
            <Pressable onPress={() => setShowRescheduleTimePicker(true)} style={{ marginBottom: 14 }}>
              <Text style={{ color: colors.text, fontSize: 16 }}>
                Time: {rescheduleTime ? rescheduleTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
            </Pressable>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
              <Pressable onPress={() => setRescheduleModalVisible(false)} style={{ marginRight: 18 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleRescheduleDueDate}>
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>Save</Text>
              </Pressable>
            </View>
            {/* Date Picker */}
            {showRescheduleDatePicker && !showRescheduleTimePicker && (
              <DateTimePicker
                value={rescheduleDate || today}
                mode="date"
                display={Platform.OS === 'android' ? 'calendar' : (Platform.OS === 'ios' ? 'inline' : 'default')}
                onChange={(event, selectedDate) => {
                  setShowRescheduleDatePicker(false);
                  if (selectedDate) setRescheduleDate(selectedDate);
                  else console.log('Reschedule date picker cancelled or error');
                }}
                minimumDate={today}
                onError={err => console.error('DateTimePicker error:', err)}
              />
            )}
            {/* Time Picker */}
            {showRescheduleTimePicker && !showRescheduleDatePicker && (
              <DateTimePicker
                value={rescheduleTime || new Date()}
                mode="time"
                display={Platform.OS === 'android' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowRescheduleTimePicker(false);
                  if (selectedTime) setRescheduleTime(selectedTime);
                  else console.log('Reschedule time picker cancelled or error');
                }}
                onError={err => console.error('DateTimePicker error:', err)}
              />
            )}
          </View>
        </View>
      </Modal>
    </DarkGradientBackground>
  );
};

const getTasks = async (): Promise<Task[]> => {
  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 7);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          title: "Complete project proposal",
          dueDate: tomorrow.toISOString(),
          completed: false,
        },
        {
          id: "2",
          title: "Review meeting notes",
          dueDate: now.toISOString(),
          completed: true,
        },
        {
          id: "3",
          title: "Update documentation",
          dueDate: nextWeek.toISOString(),
          completed: false,
        },
        {
          id: "4",
          title: "Unscheduled task",
          completed: false,
        },
      ]);
    }, 1000);
  });
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'left',
    marginLeft: 20,
  },
  addButton: {
    borderRadius: 24,
    padding: 8,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    paddingHorizontal: 0,
    marginBottom: 10,
    marginTop: 0,
    gap: 8,
  },
  statWidget: {
    flex: 1.2, // slightly more than 1 for more width
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
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
  fabContainer: {
    position: 'absolute',
    right: 28,
    bottom: 36,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionSheet: {
    width: '94%',
    borderRadius: 18,
    padding: 22,
    marginBottom: 32,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  actionBtn: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  actionText: {
    fontSize: 16,
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.2,
  },
  pickerBtn: {
    borderWidth: 1.2,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  statsSimpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 0,
  },
});

export default TasksScreen;
