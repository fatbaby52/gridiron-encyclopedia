import { create } from 'zustand'

interface UIState {
  isSidebarOpen: boolean
  isChatOpen: boolean
  isSearchOpen: boolean
  isMobileMenuOpen: boolean
  toggleSidebar: () => void
  toggleChat: () => void
  toggleSearch: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  closeSearch: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isChatOpen: false,
  isSearchOpen: false,
  isMobileMenuOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
}))
