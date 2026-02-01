import { create } from 'zustand'
import * as api from '@/lib/communityData'
import type { Playbook, CommunityPlay } from '@/types/community'

interface PlaybookState {
  playbooks: Playbook[]
  plays: CommunityPlay[]
  loading: boolean
  initialized: boolean

  loadPlaybooks: (userId: string) => Promise<void>
  loadPlays: (userId: string) => Promise<void>
  createPlaybook: (userId: string, input: { name: string; description: string; isPublic: boolean }) => Promise<Playbook | null>
  updatePlaybook: (playbookId: string, userId: string, updates: Partial<Pick<Playbook, 'name' | 'description' | 'isPublic'>>) => Promise<void>
  deletePlaybook: (playbookId: string, userId: string) => Promise<void>
  createPlay: (userId: string, authorName: string, input: { title: string; description: string; diagramData: string; playbookId: string | null; isPublic: boolean; tags: string[] }) => Promise<CommunityPlay | null>
  updatePlay: (playId: string, userId: string, updates: Partial<Pick<CommunityPlay, 'title' | 'description' | 'diagramData' | 'playbookId' | 'isPublic' | 'tags'>>) => Promise<void>
  deletePlay: (playId: string, userId: string) => Promise<void>
}

export const usePlaybookStore = create<PlaybookState>((set) => ({
  playbooks: [],
  plays: [],
  loading: false,
  initialized: false,

  loadPlaybooks: async (userId) => {
    set({ loading: true })
    const playbooks = await api.getUserPlaybooks(userId)
    set({ playbooks, loading: false, initialized: true })
  },

  loadPlays: async (userId) => {
    const plays = await api.getUserPlays(userId)
    set({ plays })
  },

  createPlaybook: async (userId, input) => {
    const playbook = await api.createPlaybook(userId, input)
    if (playbook) {
      set((s) => ({ playbooks: [playbook, ...s.playbooks] }))
    }
    return playbook
  },

  updatePlaybook: async (playbookId, userId, updates) => {
    const updated = await api.updatePlaybook(playbookId, userId, updates)
    if (updated) {
      set((s) => ({
        playbooks: s.playbooks.map((p) => (p.id === playbookId ? updated : p)),
      }))
    }
  },

  deletePlaybook: async (playbookId, userId) => {
    const success = await api.deletePlaybook(playbookId, userId)
    if (success) {
      set((s) => ({
        playbooks: s.playbooks.filter((p) => p.id !== playbookId),
        plays: s.plays.map((p) => (p.playbookId === playbookId ? { ...p, playbookId: null } : p)),
      }))
    }
  },

  createPlay: async (userId, authorName, input) => {
    const play = await api.createPlay(userId, authorName, input)
    if (play) {
      set((s) => ({ plays: [play, ...s.plays] }))
    }
    return play
  },

  updatePlay: async (playId, userId, updates) => {
    const updated = await api.updatePlay(playId, userId, updates)
    if (updated) {
      set((s) => ({
        plays: s.plays.map((p) => (p.id === playId ? updated : p)),
      }))
    }
  },

  deletePlay: async (playId, userId) => {
    const success = await api.deletePlay(playId, userId)
    if (success) {
      set((s) => ({
        plays: s.plays.filter((p) => p.id !== playId),
      }))
    }
  },
}))
