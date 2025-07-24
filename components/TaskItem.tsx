// components/TaskItem.tsx
"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface TaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  onToggle?: (id: string) => void;
  onPress?: (id: string) => void;
}

const TaskItem = ({ id, title, completed, onToggle, onPress }: TaskItemProps) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => onPress?.(id)}
      android_ripple={{ color: colors.accent }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
        marginVertical: 7,
        borderRadius: 18,
        backgroundColor: colors.surface,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
        paddingVertical: 16,
        paddingHorizontal: 14,
      }}
    >
      {/* Accent bar */}
      <View style={{ width: 5, height: 48, borderRadius: 3, marginRight: 14, backgroundColor: completed ? colors.success : colors.primary, opacity: completed ? 0.7 : 0.9 }} />
      {/* Checkbox */}
      <Pressable onPress={() => onToggle?.(id)} style={{ marginRight: 14, padding: 4 }} hitSlop={8}>
        <Ionicons
          name={completed ? "checkbox" : "checkbox-outline"}
          size={28}
          color={completed ? colors.success : colors.textSecondary}
        />
      </Pressable>
      {/* Task Info */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '600',
            color: completed ? colors.textSecondary : colors.text,
            textDecorationLine: completed ? 'line-through' : 'none',
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {/* Optionally show due date or status */}
        {/* <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{dueDate}</Text> */}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={{ marginLeft: 8 }} />
    </Pressable>
  );
};

export default TaskItem;
