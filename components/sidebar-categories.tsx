import Link from "next/link"
import { categories } from "@/lib/blog-data"
import { cn } from "@/lib/utils"

export function SidebarCategories() {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-24 bg-card border-2 border-foreground rounded-sm p-4 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="text-primary">📁</span> categories
        </h3>

        <div className="space-y-2">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/categories?cat=${encodeURIComponent(category.name)}`}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-sm font-mono text-sm",
                "border-2 border-transparent hover:border-foreground/50",
                "transition-all hover:-translate-x-1",
                category.color,
              )}
            >
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </Link>
          ))}
        </div>

        {/* Decorative sticky note */}
        <div className="mt-6 p-3 bg-accent border-2 border-foreground/50 rotate-1 shadow-xs">
          <p className="font-mono text-xs text-accent-foreground">💡 "code is poetry written by caffeinated goblins"</p>
        </div>
      </div>
    </aside>
  )
}
