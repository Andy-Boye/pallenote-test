"use client"

import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface NoteCardProps {
  note: {
    id: string | number;
    title: string;
    description?: string;
    [key: string]: any;
  };
  onPress: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12 }}>
      <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>{note.title}</Text>
      {note.description && <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{note.description}</Text>}
    </TouchableOpacity>
  );
};

export default NoteCard;
