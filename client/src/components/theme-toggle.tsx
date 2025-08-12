import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    if (theme === "dark") {
      return <Moon className="h-4 w-4" />
    } else if (theme === "light") {
      return <Sun className="h-4 w-4" />
    } else {
      // System theme - show based on actual applied theme
      const isDark = document.documentElement.classList.contains("dark")
      return isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
    }
  }

  const getTooltip = () => {
    if (theme === "light") return "Switch to dark mode"
    if (theme === "dark") return "Switch to system theme"
    return "Switch to light mode"
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      title={getTooltip()}
      className="h-8 w-8 p-0"
    >
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}