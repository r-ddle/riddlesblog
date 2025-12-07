"use client"

import { Moon, Sun, Snowflake } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="relative p-2 bg-card border-2 border-foreground rounded-sm shadow-xs"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative p-2 bg-card border-2 border-foreground rounded-sm shadow-xs hover:shadow-sm transition-all group overflow-hidden"
      aria-label={`Switch to ${theme === "light" ? "AMOLED dark" : "light"} mode`}
    >
      <div className="relative z-10 flex items-center justify-center w-5 h-5">
        {theme === "light" ? (
          <Moon className="w-4 h-4 text-foreground transition-transform group-hover:rotate-12" />
        ) : (
          <Sun className="w-4 h-4 text-accent transition-transform group-hover:rotate-45" />
        )}
      </div>
      <Snowflake className="absolute -bottom-1 -right-1 w-3 h-3 text-primary/30 group-hover:text-primary/50 transition-colors" />
    </button>
  )
}
