// components/TaskItem.tsx
"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface TaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // formatted string
  scheduled?: boolean;
  onToggle?: (id: string) => void;
  onPress?: (id: string) => void;
  onDueDatePress?: (id: string) => void;
  onLongPress?: (id: string) => void;
  selected?: boolean;
  multiSelectMode?: boolean;
}

const TaskItem = ({ id, title, completed, dueDate, scheduled, onToggle, onPress, onDueDatePress, onLongPress, selected, multiSelectMode }: TaskItemProps) => {
  const { colors } = useTheme();
  // Use a more intense color for selected border and checkboxes
  const intensePrimary = colors.primary + 'CC'; // add 80% opacity if hex, fallback to colors.primary
  const intenseAccent = colors.accent ? colors.accent + 'CC' : colors.primary + '22';

  return (
    <Pressable
      onPress={() => onPress?.(id)}
      onLongPress={() => onLongPress?.(id)}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 14,
          marginHorizontal: 14,
          marginVertical: 6,
          borderRadius: 12,
          backgroundColor: selected ? intenseAccent : colors.background,
          borderWidth: selected ? 2.5 : 1,
          borderColor: selected ? intensePrimary : colors.border,
          opacity: completed ? 0.6 : 1,
        },
      ]}
    >
      {/* Selection checkmark in multi-select mode */}
      {multiSelectMode && (
        <View style={{ marginRight: 12 }}>
          {selected ? (
            <Ionicons name="checkmark-circle" size={26} color={intensePrimary} />
          ) : (
            <Ionicons name="ellipse-outline" size={26} color={colors.border} />
          )}
        </View>
      )}
      {/* Checkbox for completed/uncompleted */}
      {!multiSelectMode && (
        <Pressable onPress={() => onToggle?.(id)} hitSlop={10} style={{ marginRight: 12 }}>
          {completed ? (
            <Ionicons name="checkbox" size={26} color={intensePrimary} />
          ) : (
            <Ionicons name="square-outline" size={26} color={colors.border} />
          )}
        </Pressable>
      )}
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
            textDecorationLine: completed ? 'line-through' : 'none',
            opacity: completed ? 0.7 : 1,
          }}
        >
          {title}
        </Text>
        {/* Due date tag if scheduled and not completed */}
        {scheduled && dueDate && !completed && (
          <Pressable onPress={() => onDueDatePress?.(id)} style={{ alignSelf: 'flex-start', marginTop: 2, backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '500' }}>{dueDate}</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
};

export default TaskItem;
