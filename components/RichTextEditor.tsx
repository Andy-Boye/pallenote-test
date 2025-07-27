import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RichEditor as PellRichEditor } from 'react-native-pell-rich-editor';

interface RichTextEditorProps {
  value: string;
  onValueChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  placeholderTextColor?: string;
  style?: any;
  pellEditorRef: React.RefObject<any>;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onValueChange,
  onFocus,
  onBlur,
  placeholder,
  style,
  pellEditorRef,
}) => {
  return (
    <View style={[styles.container, style]}>
      <PellRichEditor
        ref={pellEditorRef}
        initialContentHTML={value}
        editorStyle={{ backgroundColor: 'transparent', color: style?.color }}
        placeholder={placeholder}
        useContainer={false}
        onChange={onValueChange}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{ flex: 1, ...style }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RichTextEditor; 