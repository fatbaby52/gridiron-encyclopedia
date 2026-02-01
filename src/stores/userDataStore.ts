import { create } from 'zustand'

interface FavoriteItem {
  slug: string
  title: string
  category: string
  savedAt: number
}

interface HistoryItem {
  slug: string
  title: string
  category: string
  visitedAt: number
}

interface UserDataState {
  favorites: FavoriteItem[]
  history: HistoryItem[]
  initialized: boolean

  initialize: () => void
  addFavorite: (item: Omit<FavoriteItem, 'savedAt'>) => void
  removeFavorite: (slug: string) => void
  isFavorite: (slug: string) => boolean
  addToHistory: (item: Omit<HistoryItem, 'visitedAt'>) => void
  clearHistory: () => void
}

const FAVORITES_KEY = 'ge-favorites'
const HISTORY_KEY = 'ge-history'
const MAX_HISTORY = 50

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage full or unavailable
  }
}

export const useUserDataStore = create<UserDataState>((set, get) => ({
  favorites: [],
  history: [],
  initialized: false,

  initialize: () => {
    const favorites = loadFromStorage<FavoriteItem[]>(FAVORITES_KEY, [])
    const history = loadFromStorage<HistoryItem[]>(HISTORY_KEY, [])
    set({ favorites, history, initialized: true })
  },

  addFavorite: (item) => {
    const existing = get().favorites
    if (existing.some((f) => f.slug === item.slug)) return

    const updated = [{ ...item, savedAt: Date.now() }, ...existing]
    set({ favorites: updated })
    saveToStorage(FAVORITES_KEY, updated)
  },

  removeFavorite: (slug) => {
    const updated = get().favorites.filter((f) => f.slug !== slug)
    set({ favorites: updated })
    saveToStorage(FAVORITES_KEY, updated)
  },

  isFavorite: (slug) => {
    return get().favorites.some((f) => f.slug === slug)
  },

  addToHistory: (item) => {
    const existing = get().history.filter((h) => h.slug !== item.slug)
    const updated = [{ ...item, visitedAt: Date.now() }, ...existing].slice(0, MAX_HISTORY)
    set({ history: updated })
    saveToStorage(HISTORY_KEY, updated)
  },

  clearHistory: () => {
    set({ history: [] })
    saveToStorage(HISTORY_KEY, [])
  },
}))
