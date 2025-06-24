import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'gaming'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('whac-a-mole-theme') as Theme
    if (stored && ['light', 'dark', 'gaming'].includes(stored)) {
      return stored
    }
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    // Default to gaming theme for this game
    return 'gaming'
  })

  useEffect(() => {
    localStorage.setItem('whac-a-mole-theme', theme)
    
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark', 'gaming')
    document.documentElement.classList.add(theme)
    
    // Update CSS custom properties based on theme
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#e5e7eb')
      root.style.setProperty('--bg-card', 'rgba(31, 41, 55, 0.95)')
      root.style.setProperty('--bg-card-dark', 'rgba(17, 24, 39, 0.9)')
    } else if (theme === 'light') {
      root.style.setProperty('--bg-primary', 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)')
      root.style.setProperty('--text-primary', '#1f2937')
      root.style.setProperty('--text-secondary', '#4b5563')
      root.style.setProperty('--bg-card', 'rgba(255, 255, 255, 0.95)')
      root.style.setProperty('--bg-card-dark', 'rgba(248, 250, 252, 0.9)')
    } else {
      // Gaming theme (default)
      root.style.setProperty('--bg-primary', 'url("../public/images/mario-bg.jpg") no-repeat center center/cover')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#e5e7eb')
      root.style.setProperty('--bg-card', 'rgba(255, 255, 255, 0.1)')
      root.style.setProperty('--bg-card-dark', 'rgba(0, 0, 0, 0.8)')
    }
  }, [theme])

  const toggleTheme = () => {
    const themes: Theme[] = ['gaming', 'light', 'dark']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
