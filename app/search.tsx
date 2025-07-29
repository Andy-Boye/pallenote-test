import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
// import Voice from '@react-native-voice/voice'; // Disabled: Not supported in Expo Go
import { searchItems } from "@/api/searchApi";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";

const filters = ["all", "notes", "tasks", "recordings"];

export default function SearchScreen() {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🎤 Setup voice listener (Disabled for Expo Go)
  // useEffect(() => {
  //   Voice.onSpeechResults = (event: any) => {
  //     const spokenText = event.value?.[0];
  //     if (spokenText) {
  //       setQuery(spokenText);
  //       handleSearch(spokenText);
  //     }
  //   };
  //
  //   return () => {
  //     Voice.destroy().then(Voice.removeAllListeners);
  //   };
  // }, []);

  // const handleVoiceSearch = async () => {
  //   try {
  //     await Voice.start("en-US");
  //   } catch (e) {
  //     console.error("Voice start error", e);
  //   }
  // };

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim().length === 0) {
      setResults([]);
      return;
    }
    setLoading(true);
    const data = await searchItems(text, activeFilter);
    setResults(data);
    setLoading(false);
  }, [activeFilter]);

  useEffect(() => {
    if (query.trim()) handleSearch(query);
  }, [activeFilter, handleSearch, query]);

  const handleResultPress = (item: any) => {
    // Adjust navigation per item type
    if (item.type === "note") router.replace(`../notes/${item.id}`);
    else if (item.type === "task") router.replace(`../tasks/${item.id}`);
    else if (item.type === "recording") router.replace(`../recordings/${item.id}`);
  };

  return (
    <View className="flex-1 px-4 pt-6 bg-white dark:bg-black">
      <View className="flex-row items-center border rounded-xl px-3 py-2 bg-gray-100 dark:bg-gray-800">
        <Ionicons name="search" size={20} color={colors.text} />
        <TextInput
          placeholder="Search notes, tasks, recordings..."
          placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
          value={query}
          onChangeText={handleSearch}
          className="flex-1 ml-2 text-black dark:text-white"
        />
        {/* <TouchableOpacity onPress={handleVoiceSearch}>
          <Ionicons name="mic" size={20} color={colors.primary} />
        </TouchableOpacity> */}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4 mb-2"
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            className={`px-4 py-2 mr-2 rounded-full ${
              activeFilter === filter
                ? "bg-purple-600"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            <Text
              className={`text-sm ${
                activeFilter === filter
                  ? "text-white"
                  : "text-black dark:text-white"
              } capitalize`}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleResultPress(item)}
            className="p-4 mb-2 rounded-xl bg-gray-100 dark:bg-gray-800"
          >
            <Text className="text-base font-medium text-black dark:text-white">
              {item.title}
            </Text>
            <Text className="text-xs text-gray-500 mt-1 capitalize">
              {item.type}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="small" color={colors.primary} className="mt-6" />
          ) : results.length === 0 && query.trim() ? (
            <Text className="text-center text-gray-500 mt-4">No results found</Text>
          ) : null
        }
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      />
    </View>
  );
}
