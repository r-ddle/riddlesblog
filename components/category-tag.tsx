import { getCategories } from "@/lib/blog-actions"
import { cn } from "@/lib/utils"

interface CategoryTagProps {
  category: string
  size?: "sm" | "md"
}

// Default categories for fallback
const defaultCategories = [
  { name: "terminal therapy", emoji: "//", color: "bg-blue-200 dark:bg-blue-900/40" },
  { name: "ecommerce chaos", emoji: "[]", color: "bg-cyan-200 dark:bg-cyan-900/40" },
  { name: "debugging logs", emoji: "><", color: "bg-amber-200 dark:bg-amber-900/40" },
  { name: "random rants", emoji: "{}", color: "bg-green-200 dark:bg-green-900/40" },
  { name: "tech philosophy", emoji: "()", color: "bg-purple-200 dark:bg-purple-900/40" },
]

export async function CategoryTag({ category, size = "sm" }: CategoryTagProps) {
  let categories
  try {
    categories = await getCategories()
  } catch {
    categories = defaultCategories
  }

  const categoryData = categories.find((c) => c.name === category) || defaultCategories.find((c) => c.name === category)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono font-medium border-2 border-foreground/80 rotate-[-1deg]",
        "shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]",
        categoryData?.color || "bg-secondary",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
      )}
    >
      {categoryData?.emoji || "//"} {category}
    </span>
  )
}

// Client-side version for use in client components
export function CategoryTagClient({
  category,
  categoryData,
  size = "sm",
}: CategoryTagProps & { categoryData?: { emoji?: string | null; color: string } }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono font-medium border-2 border-foreground/80 rotate-[-1deg]",
        "shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]",
        categoryData?.color || "bg-secondary",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
      )}
    >
      {categoryData?.emoji || "//"} {category}
    </span>
  )
}
