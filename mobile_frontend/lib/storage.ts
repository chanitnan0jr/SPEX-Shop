import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

/**
 * Universal storage utility that works on both Native (SecureStore) and Web (LocalStorage).
 * This prevents crashes on web while maintaining high security on mobile devices.
 */
export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key)
      }
      return await SecureStore.getItemAsync(key)
    } catch (error) {
      console.error(`[Storage] Error reading key: ${key}`, error)
      return null
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value)
        return
      }
      await SecureStore.setItemAsync(key, value)
    } catch (error) {
      console.error(`[Storage] Error writing key: ${key}`, error)
    }
  },

  async deleteItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key)
        return
      }
      await SecureStore.deleteItemAsync(key)
    } catch (error) {
      console.error(`[Storage] Error deleting key: ${key}`, error)
    }
  }
}
