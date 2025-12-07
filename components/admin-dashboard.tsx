"use client"

import type React from "react"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { BlogPost, Category } from "@/lib/db"
import { deletePost, togglePublishStatus } from "@/lib/blog-actions"
import { Plus, Edit, Trash2, Eye, EyeOff, Search, MoreVertical, FileText, Clock, Tag, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminDashboardProps {
  posts: BlogPost[]
  categories: Category[]
}

export function AdminDashboard({ posts, categories }: AdminDashboardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all")
  const [activeMenu, setActiveMenu] = useState<number | null>(null)

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !filterCategory || post.category === filterCategory
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && post.published) ||
      (filterStatus === "draft" && !post.published)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    startTransition(async () => {
      await deletePost(id)
      router.refresh()
    })
  }

  const handleTogglePublish = async (id: number) => {
    startTransition(async () => {
      await togglePublishStatus(id)
      router.refresh()
    })
  }

  const publishedCount = posts.filter((p) => p.published).length
  const draftCount = posts.filter((p) => !p.published).length

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Blog Dashboard</h1>
          <p className="text-muted-foreground font-mono text-sm">Manage your posts and drafts</p>
        </div>
        <Link
          href="/admin/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-sm font-medium border-2 border-foreground rounded-sm shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Posts" value={posts.length} icon={FileText} />
        <StatCard label="Published" value={publishedCount} icon={CheckCircle} color="text-green-500" />
        <StatCard label="Drafts" value={draftCount} icon={Clock} color="text-amber-500" />
        <StatCard label="Categories" value={categories.length} icon={Tag} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2 bg-card border-2 border-foreground rounded-sm font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-card border-2 border-foreground rounded-sm font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-3 py-2 bg-card border-2 border-foreground rounded-sm font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-card border-2 border-foreground rounded-sm shadow-xs overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-mono text-lg mb-2">No posts found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery || filterCategory || filterStatus !== "all"
                ? "Try adjusting your filters"
                : "Create your first post to get started"}
            </p>
            {!searchQuery && !filterCategory && filterStatus === "all" && (
              <Link
                href="/admin/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-sm border-2 border-foreground rounded-sm"
              >
                <Plus className="w-4 h-4" />
                Create Post
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y-2 divide-foreground/20">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono",
                          post.published
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-amber-500/20 text-amber-700 dark:text-amber-400",
                        )}
                      >
                        {post.published ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Published
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> Draft
                          </>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{post.category}</span>
                    </div>

                    <Link
                      href={`/admin/edit/${post.id}`}
                      className="font-bold hover:text-primary transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>

                    {post.excerpt && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{post.excerpt}</p>}

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-mono">
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <span>|</span>
                      <span>{post.reading_time}</span>
                      {post.tags.length > 0 && (
                        <>
                          <span>|</span>
                          <span>
                            {post.tags
                              .slice(0, 3)
                              .map((t) => `#${t}`)
                              .join(" ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === post.id ? null : post.id)}
                      className="p-2 hover:bg-secondary rounded-sm transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenu === post.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-card border-2 border-foreground rounded-sm shadow-sm overflow-hidden">
                          <Link
                            href={`/admin/edit/${post.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
                            onClick={() => setActiveMenu(null)}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Link>
                          {post.published && (
                            <Link
                              href={`/post/${post.slug}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors"
                              onClick={() => setActiveMenu(null)}
                            >
                              <Eye className="w-4 h-4" />
                              View Post
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              handleTogglePublish(post.id)
                              setActiveMenu(null)
                            }}
                            disabled={isPending}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors w-full"
                          >
                            {post.published ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                Publish
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(post.id)
                              setActiveMenu(null)
                            }}
                            disabled={isPending}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = "text-primary",
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color?: string
}) {
  return (
    <div className="p-4 bg-card border-2 border-foreground rounded-sm shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground font-mono">{label}</span>
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}
