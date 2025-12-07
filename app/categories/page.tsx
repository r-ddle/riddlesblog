import { Suspense } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PostCard } from "@/components/post-card"
import { categories, blogPosts, getPostsByCategory } from "@/lib/blog-data"
import { cn } from "@/lib/utils"

interface CategoriesPageProps {
  searchParams: Promise<{ cat?: string }>
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const { cat } = await searchParams
  const selectedCategory = cat || null
  const filteredPosts = selectedCategory ? getPostsByCategory(selectedCategory) : blogPosts

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            📁 browse the <span className="text-primary">chaos</span>
          </h1>
          <p className="font-serif text-muted-foreground text-lg">organized disorder, if you will</p>
        </header>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Link
            href="/categories"
            className={cn(
              "px-4 py-2 font-mono text-sm border-2 border-foreground rounded-sm shadow-xs hover:shadow-sm transition-all",
              !selectedCategory ? "bg-primary text-primary-foreground" : "bg-card hover:-translate-y-1",
            )}
          >
            all posts
          </Link>
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/categories?cat=${encodeURIComponent(category.name)}`}
              className={cn(
                "px-4 py-2 font-mono text-sm border-2 border-foreground rounded-sm shadow-xs hover:shadow-sm transition-all",
                selectedCategory === category.name
                  ? "bg-primary text-primary-foreground"
                  : `${category.color} hover:-translate-y-1`,
              )}
            >
              {category.emoji} {category.name}
            </Link>
          ))}
        </div>

        {/* Results Header */}
        {selectedCategory && (
          <div className="mb-8 p-4 bg-card border-2 border-foreground rounded-sm shadow-xs">
            <p className="font-mono text-sm">
              showing <strong>{filteredPosts.length}</strong> posts in{" "}
              <span className="text-primary">{selectedCategory}</span>
            </p>
          </div>
        )}

        {/* Posts Grid */}
        <Suspense fallback={<div>Loading...</div>}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </Suspense>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="font-mono text-muted-foreground text-lg mb-4">🤷 no posts found in this category</p>
            <Link
              href="/categories"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground font-mono text-sm border-2 border-foreground rounded-sm shadow-xs hover:shadow-sm"
            >
              view all posts
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
