import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  darkMode: boolean
  toggleDarkMode: () => void

  lastInputs: Record<string, string>
  setLastInput: (module: string, input: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () =>
        set((s) => {
          const next = !s.darkMode
          if (next) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { darkMode: next }
        }),

      lastInputs: {},
      setLastInput: (module, input) =>
        set((s) => ({ lastInputs: { ...s.lastInputs, [module]: input } })),
    }),
    {
      name: 'edii-visualizer-store',
      onRehydrateStorage: () => (state) => {
        if (state?.darkMode) {
          document.documentElement.classList.add('dark')
        }
      },
    }
  )
)
