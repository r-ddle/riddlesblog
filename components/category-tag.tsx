import { categories } from "@/lib/blog-data"
import { cn } from "@/lib/utils"

interface CategoryTagProps {
  category: string
  size?: "sm" | "md"
}

export function CategoryTag({ category, size = "sm" }: CategoryTagProps) {
  const categoryData = categories.find((c) => c.name === category)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono font-medium border-2 border-foreground/80 rotate-[-1deg]",
        "shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]",
        categoryData?.color || "bg-secondary",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
      )}
    >
      {categoryData?.emoji} {category}
    </span>
  )
}
