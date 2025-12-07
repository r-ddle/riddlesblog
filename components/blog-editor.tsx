"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MarkdownEditor } from "./markdown-editor"
import { createPost, updatePost, getCategories, saveDraft } from "@/lib/blog-actions"
import type { BlogPost, Category } from "@/lib/db"
import {
  Save,
  Send,
  X,
  Tag,
  FolderOpen,
  ImageIcon,
  FileText,
  Clock,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BlogEditorProps {
  post?: BlogPost
  onClose?: () => void
}

export function BlogEditor({ post, onClose }: BlogEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [title, setTitle] = useState(post?.title || "")
  const [content, setContent] = useState(post?.content || "")
  const [excerpt, setExcerpt] = useState(post?.excerpt || "")
  const [category, setCategory] = useState(post?.category || "")
  const [tags, setTags] = useState<string[]>(post?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [imageUrl, setImageUrl] = useState(post?.image_url || "")
  const [categories, setCategories] = useState<Category[]>([])

  // UI state
  const [showPreview, setShowPreview] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load categories
  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (title || content) {
        handleAutoSave()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [title, content, excerpt, category, tags, imageUrl])

  // Also save to localStorage as backup
  useEffect(() => {
    const draft = { title, content, excerpt, category, tags, imageUrl }
    localStorage.setItem("blog-draft", JSON.stringify(draft))
  }, [title, content, excerpt, category, tags, imageUrl])

  // Load from localStorage on mount (if no post)
  useEffect(() => {
    if (!post) {
      const saved = localStorage.getItem("blog-draft")
      if (saved) {
        try {
          const draft = JSON.parse(saved)
          if (draft.title) setTitle(draft.title)
          if (draft.content) setContent(draft.content)
          if (draft.excerpt) setExcerpt(draft.excerpt)
          if (draft.category) setCategory(draft.category)
          if (draft.tags) setTags(draft.tags)
          if (draft.imageUrl) setImageUrl(draft.imageUrl)
        } catch (e) {
          console.error("Failed to load draft", e)
        }
      }
    }
  }, [post])

  const handleAutoSave = useCallback(async () => {
    setAutoSaveStatus("saving")
    try {
      await saveDraft({
        post_id: post?.id,
        title,
        content,
        excerpt,
        category,
        tags,
        image_url: imageUrl,
      })
      setAutoSaveStatus("saved")
      setLastSaved(new Date())
      setTimeout(() => setAutoSaveStatus("idle"), 2000)
    } catch (e) {
      console.error("Auto-save failed", e)
      setAutoSaveStatus("error")
    }
  }, [post?.id, title, content, excerpt, category, tags, imageUrl])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = "Title is required"
    if (!content.trim()) newErrors.content = "Content is required"
    if (!category) newErrors.category = "Category is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleSave = async (publish = false) => {
    if (!validate()) return

    startTransition(async () => {
      try {
        if (post) {
          await updatePost(post.id, {
            title,
            content,
            excerpt,
            category,
            tags,
            image_url: imageUrl,
            published: publish ? true : post.published,
          })
        } else {
          await createPost({
            title,
            content,
            excerpt,
            category,
            tags,
            image_url: imageUrl,
            published: publish,
          })
          // Clear localStorage draft after successful create
          localStorage.removeItem("blog-draft")
        }

        router.push("/admin")
        router.refresh()
      } catch (e) {
        console.error("Failed to save post", e)
        setErrors({ submit: "Failed to save post. Please try again." })
      }
    })
  }

  const estimatedReadingTime = Math.ceil(content.split(/\s+/).length / 200)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-foreground">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose || (() => router.push("/admin"))}
              className="p-2 hover:bg-secondary rounded-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg truncate">{post ? "Edit Post" : "New Post"}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-save status */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              {autoSaveStatus === "saving" && (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {autoSaveStatus === "saved" && (
                <>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Saved</span>
                </>
              )}
              {autoSaveStatus === "error" && (
                <>
                  <AlertCircle className="w-3 h-3 text-destructive" />
                  <span>Save failed</span>
                </>
              )}
              {lastSaved && autoSaveStatus === "idle" && <span>Last saved {lastSaved.toLocaleTimeString()}</span>}
            </div>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-sm border-2 border-foreground transition-all",
                showPreview ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary",
              )}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>

            <button
              onClick={() => handleSave(false)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-sm bg-card border-2 border-foreground hover:bg-secondary disabled:opacity-50 transition-all"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline">Save Draft</span>
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-sm bg-accent text-accent-foreground border-2 border-foreground hover:opacity-90 disabled:opacity-50 transition-all shadow-xs hover:shadow-sm"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">Publish</span>
            </button>
          </div>
        </div>
      </header>

      {errors.submit && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="p-3 bg-destructive/10 border-2 border-destructive rounded-sm text-destructive text-sm">
            {errors.submit}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {showPreview ? (
          <PostPreview
            title={title}
            content={content}
            excerpt={excerpt}
            category={category}
            tags={tags}
            imageUrl={imageUrl}
            readingTime={`${estimatedReadingTime} min`}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-4">
              {/* Title */}
              <div>
                <label className="block font-mono text-sm font-medium mb-1.5">
                  <FileText className="w-4 h-4 inline mr-1.5" />
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your post title..."
                  className={cn(
                    "w-full px-4 py-3 text-xl font-bold bg-card border-2 rounded-sm shadow-xs focus:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
                    errors.title ? "border-destructive" : "border-foreground",
                  )}
                />
                {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Content Editor */}
              <div>
                <label className="block font-mono text-sm font-medium mb-1.5">Content</label>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  onSave={handleAutoSave}
                  placeholder="Write your post content in Markdown..."
                  className={errors.content ? "border-destructive" : ""}
                />
                {errors.content && <p className="text-destructive text-sm mt-1">{errors.content}</p>}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Post Stats */}
              <div className="p-4 bg-card border-2 border-foreground rounded-sm shadow-xs">
                <h3 className="font-mono text-sm font-medium mb-3">Post Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Words</span>
                    <span className="font-mono">{content.split(/\s+/).filter(Boolean).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Characters</span>
                    <span className="font-mono">{content.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Reading time
                    </span>
                    <span className="font-mono">{estimatedReadingTime} min</span>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="p-4 bg-card border-2 border-foreground rounded-sm shadow-xs">
                <label className="block font-mono text-sm font-medium mb-2">
                  <FolderOpen className="w-4 h-4 inline mr-1.5" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 bg-background border-2 rounded-sm font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                    errors.category ? "border-destructive" : "border-foreground",
                  )}
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-destructive text-sm mt-1">{errors.category}</p>}
              </div>

              {/* Tags */}
              <div className="p-4 bg-card border-2 border-foreground rounded-sm shadow-xs">
                <label className="block font-mono text-sm font-medium mb-2">
                  <Tag className="w-4 h-4 inline mr-1.5" />
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-1.5 bg-background border-2 border-foreground rounded-sm font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-secondary border-2 border-foreground rounded-sm font-mono text-sm hover:bg-secondary/80 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 border border-primary/50 rounded text-xs font-mono"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Excerpt */}
              <div className="p-4 bg-card border-2 border-foreground rounded-sm shadow-xs">
                <label className="block font-mono text-sm font-medium mb-2">Excerpt (optional)</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description for previews..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border-2 border-foreground rounded-sm font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Featured Image */}
              <div className="p-4 bg-card border-2 border-foreground rounded-sm shadow-xs">
                <label className="block font-mono text-sm font-medium mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1.5" />
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-background border-2 border-foreground rounded-sm font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {imageUrl && (
                  <div className="mt-2 relative aspect-video bg-muted rounded overflow-hidden border border-foreground/20">
                    <img src={imageUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Post Preview Component
function PostPreview({
  title,
  content,
  excerpt,
  category,
  tags,
  imageUrl,
  readingTime,
}: {
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  imageUrl: string
  readingTime: string
}) {
  const parseMarkdown = (md: string): string => {
    return md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        '<pre class="bg-muted p-4 rounded-sm overflow-x-auto border-2 border-foreground my-4"><code class="text-sm">$2</code></pre>',
      )
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/^### (.*)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2">$1</h3>')
      .replace(/^## (.*)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
      .replace(/^# (.*)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>')
      .replace(
        /!\[([^\]]*)\]$$([^)]+)$$/g,
        '<img src="$2" alt="$1" class="rounded-sm border-2 border-foreground my-4" />',
      )
      .replace(
        /^&gt; (.*)$/gm,
        '<blockquote class="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">$1</blockquote>',
      )
      .replace(/^---$/gm, '<hr class="border-t-2 border-foreground my-8" />')
      .replace(/^- (.*)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\n\n/g, "</p><p class='my-4'>")
  }

  return (
    <article className="max-w-3xl mx-auto">
      <div className="bg-card border-2 border-foreground rounded-sm shadow-sm p-6 md:p-8">
        {/* Header */}
        <header className="mb-8">
          {category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 border-2 border-foreground/50 rounded-sm font-mono text-xs mb-4 rotate-[-1deg]">
              {category}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{title || "Untitled Post"}</h1>
          {excerpt && <p className="text-lg text-muted-foreground font-serif">{excerpt}</p>}
          <div className="flex items-center gap-3 mt-4 font-mono text-sm text-muted-foreground">
            <span>{new Date().toLocaleDateString()}</span>
            <span className="text-primary">|</span>
            <span>{readingTime}</span>
          </div>
        </header>

        {/* Featured Image */}
        {imageUrl && (
          <div className="relative mb-8 bg-white p-3 border-2 border-foreground/20 shadow-xs rotate-[0.5deg]">
            <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full aspect-video object-cover" />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-sm md:prose-base max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: `<p class='my-4'>${parseMarkdown(content)}</p>` }}
        />

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-8 pt-6 border-t-2 border-foreground/20">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-secondary/50 border border-foreground/30 rounded font-mono text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
