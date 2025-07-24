"use client";

import QuickStat from "@/components/QuickStat";
import TaskItem from "@/components/TaskItem";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DarkGradientBackground from '../../components/DarkGradientBackground';

type Task = {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
};

const TasksScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

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
    router.push(`/tasks/${id}/edit`);
  };

  const handleToggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

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
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary, marginRight: 10 }}>📝</Text>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Tasks</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Stay organized and productive</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('../tasks/new')} style={[styles.addButton, { backgroundColor: colors.primary }]}> 
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats - evenly spaced row */}
      <View style={styles.statsRow}>
        <QuickStat label="Total" value={totalTasks} icon="list" />
        <QuickStat label="Completed" value={completedTasks} icon="check-circle" />
        <QuickStat label="Pending" value={pendingTasks} icon="clock" />
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            id={item.id}
            title={item.title}
            completed={item.completed}
            onToggle={handleToggle}
            onPress={handleTaskPress}
          />
        )}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 10 }}>✅</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>No tasks yet</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', maxWidth: 260 }}>
              You're all caught up! Add a new task to get started.
            </Text>
            <Text style={{ color: colors.primary, fontSize: 15, marginTop: 18, fontWeight: '500' }}>
              Tip: Tap the New Task button to add a task.
            </Text>
          </View>
        }
      />
    </DarkGradientBackground>
  );
};

const getTasks = async (): Promise<Task[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          title: "Complete project proposal",
          dueDate: "Due: Tomorrow",
          completed: false,
        },
        {
          id: "2",
          title: "Review meeting notes",
          dueDate: "Due: Today",
          completed: true,
        },
        {
          id: "3",
          title: "Update documentation",
          dueDate: "Due: Next week",
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
  addButton: {
    borderRadius: 24,
    padding: 8,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 2,
    gap: 8,
  },
  fabContainer: {},
});

export default TasksScreen;
