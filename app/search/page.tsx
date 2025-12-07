import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SearchBox } from "@/components/search-box"
import { PostCard } from "@/components/post-card"
import { searchPosts } from "@/lib/blog-data"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q || ""
  const results = query ? searchPosts(query) : []

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            🔍 search the <span className="text-primary">void</span>
          </h1>
          <p className="font-serif text-muted-foreground text-lg mb-8">
            find that one post you vaguely remember existing
          </p>

          <Suspense fallback={<div>Loading...</div>}>
            <SearchBox />
          </Suspense>
        </header>

        {/* Results */}
        {query && (
          <div className="mt-12">
            <div className="mb-6 p-4 bg-card border-2 border-foreground rounded-sm shadow-xs">
              <p className="font-mono text-sm">
                found <strong>{results.length}</strong> results for <span className="text-primary">"{query}"</span>
              </p>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card border-2 border-dashed border-foreground/50 rounded-sm">
                <p className="font-mono text-muted-foreground text-lg mb-2">🤔 nothing found</p>
                <p className="font-serif text-sm text-muted-foreground">
                  try a different search term, or maybe that post was just a fever dream
                </p>
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="text-center py-16 bg-card border-2 border-dashed border-foreground/50 rounded-sm">
            <p className="font-mono text-muted-foreground text-lg">👆 type something above to start searching</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
