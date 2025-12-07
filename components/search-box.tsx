"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, X, Loader2, ArrowRight } from "lucide-react"
import { fuzzySearch, highlightMatches } from "@/lib/fuzzy-search"
import useSWR from "swr"
import type { BlogPost } from "@/lib/db"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function SearchBox() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch all posts for client-side fuzzy search
  const { data: posts, isLoading } = useSWR<BlogPost[]>("/api/posts", fetcher)

  // Perform fuzzy search on posts
  const searchResults =
    query && posts
      ? fuzzySearch(posts, query, (post) => [post.title, post.excerpt || "", post.category, ...post.tags]).slice(0, 6)
      : []

  useEffect(() => {
    setQuery(searchParams.get("q") || "")
  }, [searchParams])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
    }
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, -1))
      } else if (e.key === "Enter" && selectedIndex >= 0 && searchResults[selectedIndex]) {
        e.preventDefault()
        router.push(`/post/${searchResults[selectedIndex].item.slug}`)
        setIsOpen(false)
      } else if (e.key === "Escape") {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    },
    [searchResults, selectedIndex, router],
  )

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
              setSelectedIndex(-1)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="search the chaos..."
            className="w-full px-4 py-3 pl-12 pr-24 font-mono text-sm bg-card border-2 border-foreground rounded-sm shadow-xs focus:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                inputRef.current?.focus()
              }}
              className="absolute right-20 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-primary-foreground font-mono text-sm font-medium border-2 border-foreground rounded-sm shadow-xs hover:shadow-sm hover:-translate-y-[calc(50%+2px)] transition-all"
        >
          go
        </button>
      </form>

      {/* Instant Results Dropdown */}
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-foreground rounded-sm shadow-md z-50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="divide-y divide-foreground/10">
                {searchResults.map((result, index) => (
                  <Link
                    key={result.item.slug}
                    href={`/post/${result.item.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={`block p-3 hover:bg-secondary/50 transition-colors ${
                      index === selectedIndex ? "bg-secondary/50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4
                          className="font-medium text-sm truncate"
                          dangerouslySetInnerHTML={{ __html: highlightMatches(result.item.title, query) }}
                        />
                        {result.item.excerpt && (
                          <p
                            className="text-xs text-muted-foreground truncate mt-0.5"
                            dangerouslySetInnerHTML={{
                              __html: highlightMatches(result.item.excerpt.substring(0, 100), query),
                            }}
                          />
                        )}
                      </div>
                      <span className="text-xs font-mono text-muted-foreground shrink-0">
                        {Math.round(result.score * 100)}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 p-2 bg-muted/50 text-sm font-mono hover:bg-muted transition-colors"
              >
                See all results <ArrowRight className="w-3 h-3" />
              </Link>
            </>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <p>No results found for "{query}"</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
