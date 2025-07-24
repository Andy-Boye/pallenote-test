import AsyncStorage from "@react-native-async-storage/async-storage"

// Local storage utilities for Pallenote

export const setItem = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(key, jsonValue)
  } catch (error) {
    console.error(`Error storing item ${key}:`, error)
    throw new Error(`Failed to store ${key}`)
  }
}

export const getItem = async <T>(key: string)
: Promise<T | null> =>
{
  try {
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue != null ? JSON.parse(jsonValue) : null
  } catch (error) {
    console.error(`Error retrieving item ${key}:`, error)
    return null
  }
}

export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing item ${key}:`, error)
    throw new Error(`Failed to remove ${key}`)
  }
}

export const clearAll = async (): Promise<void> => {
  try {
    await AsyncStorage.clear()
  } catch (error) {
    console.error("Error clearing storage:", error)
    throw new Error("Failed to clear storage")
  }
}

export const getAllKeys = async (): Promise<string[]> => {
  try {
    return Array.from(await AsyncStorage.getAllKeys());
  } catch (error) {
    console.error("Error getting all keys:", error)
    return [];
  }
}

export const multiSet = async (keyValuePairs: [string, any][]): Promise<void> => {
  try {
    const jsonPairs: [string, string][] = keyValuePairs.map(([key, value]) => [key, JSON.stringify(value)])
    await AsyncStorage.multiSet(jsonPairs)
  } catch (error) {
    console.error("Error setting multiple items:", error)
    throw new Error("Failed to set multiple items")
  }
}

export const multiGet = async (keys: string[]): Promise<Record<string, any>> => {
  try {
    const keyValuePairs = await AsyncStorage.multiGet(keys)
    const result: Record<string, any> = {}

    keyValuePairs.forEach(([key, value]) => {
      if (value !== null) {
        try {
          result[key] = JSON.parse(value)
        } catch {
          result[key] = value
        }
      }
    })

    return result
  } catch (error) {
    console.error("Error getting multiple items:", error)
    return {}
  }
}

// App-specific storage keys
export const STORAGE_KEYS = {
  USER: "user",
  AUTH_TOKEN: "authToken",
  REFRESH_TOKEN: "refreshToken",
  THEME: "theme",
  LANGUAGE: "language",
  SETTINGS: "settings",
  DRAFT_NOTES: "draftNotes",
  OFFLINE_QUEUE: "offlineQueue",
  LAST_SYNC: "lastSync",
} as const

// Typed storage helpers
export const storeUser = (user: any) => setItem(STORAGE_KEYS.USER, user)
export const getUser = () => getItem(STORAGE_KEYS.USER)
export const removeUser = () => removeItem(STORAGE_KEYS.USER)

export const storeAuthToken = (token: string) => setItem(STORAGE_KEYS.AUTH_TOKEN, token)
export const getAuthToken = () => getItem<string>(STORAGE_KEYS.AUTH_TOKEN)
export const removeAuthToken = () => removeItem(STORAGE_KEYS.AUTH_TOKEN)

export const storeTheme = (theme: string) => setItem(STORAGE_KEYS.THEME, theme)
export const getTheme = () => getItem<string>(STORAGE_KEYS.THEME)

export const storeDraftNote = async (noteId: string, content: any) => {
  const drafts = (await getItem(STORAGE_KEYS.DRAFT_NOTES)) as Record<string, any> || {};
  drafts[noteId] = content;
  await setItem(STORAGE_KEYS.DRAFT_NOTES, drafts);
}

export const getDraftNote = async (noteId: string) => {
  const drafts = (await getItem(STORAGE_KEYS.DRAFT_NOTES)) as Record<string, any> || {};
  return drafts[noteId] || null;
}

export const removeDraftNote = async (noteId: string) => {
  const drafts = (await getItem(STORAGE_KEYS.DRAFT_NOTES)) as Record<string, any> || {};
  delete drafts[noteId];
  await setItem(STORAGE_KEYS.DRAFT_NOTES, drafts);
}
