import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface RichTextEditorProps {
  value: string;
  onValueChange: (value: string) => void;
  minHeight?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  placeholderTextColor?: string;
  style?: any;
}

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  alignment: 'left' | 'center' | 'right';
}

export const RichTextEditor = React.forwardRef<any, RichTextEditorProps>(({
  value,
  onValueChange,
  minHeight = 120,
  onFocus,
  onBlur,
  placeholder,
  placeholderTextColor,
  style,
}, ref) => {
  const inputRef = useRef<TextInput>(null);
  const [formatState, setFormatState] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alignment: 'left',
  });

  const getTextStyle = () => {
    const styles: any = {
      color: style?.color || '#FFFFFF', // Ensure text color is applied
    };
    if (formatState.bold) styles.fontWeight = 'bold';
    if (formatState.italic) styles.fontStyle = 'italic';
    if (formatState.underline) styles.textDecorationLine = 'underline';
    if (formatState.strikethrough) styles.textDecorationLine = 'line-through';
    if (formatState.underline && formatState.strikethrough) {
      styles.textDecorationLine = 'underline line-through';
    }
    styles.textAlign = formatState.alignment;
    return styles;
  };

  const toggleFormat = (format: keyof FormatState) => {
    setFormatState(prev => ({
      ...prev,
      [format]: !prev[format],
    }));
  };

  // Expose formatting methods to parent component
  React.useImperativeHandle(ref, () => ({
    toggleBold: () => toggleFormat('bold'),
    toggleItalic: () => toggleFormat('italic'),
    toggleUnderline: () => toggleFormat('underline'),
    toggleStrikethrough: () => toggleFormat('strikethrough'),
    setAlignment: (alignment: 'left' | 'center' | 'right') => {
      setFormatState(prev => ({ ...prev, alignment }));
    },
    getFormatState: () => formatState,
  }));

  return (
    <View style={[styles.container, { minHeight }]}>
      <TextInput
        ref={inputRef}
        style={[styles.textInput, getTextStyle()]}
        value={value}
        onChangeText={onValueChange}
        multiline
        textAlignVertical="top"
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 17,
    padding: 0,
    textAlignVertical: 'top',
    color: '#FFFFFF', // Default text color
  },
});

export default RichTextEditor; 