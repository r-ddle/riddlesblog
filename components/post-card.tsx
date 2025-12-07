import Link from "next/link"
import Image from "next/image"
import { CategoryTagClient } from "./category-tag"

interface PostCardPost {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: string
  category: string
  tags: string[]
  image?: string
}

interface PostCardProps {
  post: PostCardPost
  featured?: boolean
}

// Default categories for client-side rendering
const defaultCategories = [
  { name: "terminal therapy", emoji: "//", color: "bg-blue-200 dark:bg-blue-900/40" },
  { name: "ecommerce chaos", emoji: "[]", color: "bg-cyan-200 dark:bg-cyan-900/40" },
  { name: "debugging logs", emoji: "><", color: "bg-amber-200 dark:bg-amber-900/40" },
  { name: "random rants", emoji: "{}", color: "bg-green-200 dark:bg-green-900/40" },
  { name: "tech philosophy", emoji: "()", color: "bg-purple-200 dark:bg-purple-900/40" },
]

export function PostCard({ post, featured = false }: PostCardProps) {
  const categoryData = defaultCategories.find((c) => c.name === post.category)

  return (
    <Link href={`/post/${post.slug}`} className="group block">
      <article
        className={`
          relative bg-card border-2 border-foreground rounded-sm
          shadow-sm hover:shadow-md transition-all duration-200
          hover:-translate-y-1 hover:rotate-[0.5deg]
          ${featured ? "p-5" : "p-4"}
        `}
      >
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('/placeholder.svg?height=100&width=100')] bg-repeat" />

        {/* Polaroid-style image frame */}
        {post.image && (
          <div className="relative mb-4 bg-white dark:bg-muted p-2 border-2 border-foreground/20 shadow-xs">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        )}

        {/* Category Tag - Sticky note style */}
        <div className="mb-3">
          <CategoryTagClient category={post.category} categoryData={categoryData} />
        </div>

        {/* Title */}
        <h3
          className={`font-bold leading-tight mb-2 group-hover:text-primary transition-colors ${featured ? "text-xl" : "text-lg"}`}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-serif">{post.excerpt}</p>

        {/* Meta info - monospaced */}
        <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <span>{post.date}</span>
          <span className="text-primary">|</span>
          <span>{post.readingTime}</span>
        </div>

        {/* Corner fold effect */}
        <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-bl from-background to-transparent" />
      </article>
    </Link>
  )
}
