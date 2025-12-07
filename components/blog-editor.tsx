"use client"

import type React from "react"
import { useState, useEffect, useCallback, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
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
  Plus,
  Trash2,
  GripVertical,
  Type,
  Quote,
  List,
  ListOrdered,
  Sparkles,
  Flame,
  Minus,
  Code,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { renderInlineMarkdown } from "@/lib/markdown"
import { CodeBlock } from "./code-block"

type Block =
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "heading"; level: 1 | 2 | 3; text: string }
  | { id: string; type: "code"; language: string; code: string; caption?: string }
  | { id: string; type: "quote"; text: string; attribution?: string }
  | { id: string; type: "callout"; variant: "idea" | "fun" | "note" | "warn"; title?: string; text: string }
  | { id: string; type: "list"; ordered: boolean; items: string[] }
  | { id: string; type: "image"; url: string; alt?: string; caption?: string }
  | { id: string; type: "divider" }

interface BlogEditorProps {
  post?: BlogPost
  onClose?: () => void
}

const createId = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))

const defaultBlocks: Block[] = [{ id: createId(), type: "paragraph", text: "" }]

function parseBlocks(raw?: string): Block[] {
  if (!raw) return defaultBlocks
  try {
    const parsed = JSON.parse(raw)
    const blocks = Array.isArray(parsed?.blocks) ? parsed.blocks : Array.isArray(parsed) ? parsed : []
    if (blocks.length) {
      return blocks.map((b: any) => ({ ...b, id: b.id || createId() })) as Block[]
    }
  } catch (e) {
    // ignore and fallback
  }
  return [{ id: createId(), type: "paragraph", text: raw }]
}

function serializeBlocks(blocks: Block[]): string {
  return JSON.stringify({ version: "2025-12", blocks })
}

function blocksToPlainText(blocks: Block[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
        case "heading":
        case "quote":
          return block.text
        case "callout":
          return `${block.title || block.variant}: ${block.text}`
        case "list":
          return block.items.join(" ")
        case "code":
          return block.code
        default:
          return ""
      }
    })
    .join(" ")
    .trim()
}

function estimateReadingTimeFromBlocks(blocks: Block[]) {
  const words = blocksToPlainText(blocks).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function BlogEditor({ post, onClose }: BlogEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [title, setTitle] = useState(post?.title || "")
  const [blocks, setBlocks] = useState<Block[]>(parseBlocks(post?.content))
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

  const serializedContent = useMemo(() => serializeBlocks(blocks), [blocks])
  const estimatedReadingTime = estimateReadingTimeFromBlocks(blocks)
  const wordCount = blocksToPlainText(blocks).split(/\s+/).filter(Boolean).length
  const charCount = blocksToPlainText(blocks).length

  // Load categories
  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  // Also save to localStorage as backup
  useEffect(() => {
    const draft = { title, blocks, excerpt, category, tags, imageUrl }
    localStorage.setItem("blog-draft", JSON.stringify(draft))
  }, [title, blocks, excerpt, category, tags, imageUrl])

  // Load from localStorage on mount (if no post)
  useEffect(() => {
    if (!post) {
      const saved = localStorage.getItem("blog-draft")
      if (saved) {
        try {
          const draft = JSON.parse(saved)
          if (draft.title) setTitle(draft.title)
          if (draft.blocks) setBlocks(draft.blocks)
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
        content: serializedContent,
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
  }, [post?.id, title, serializedContent, excerpt, category, tags, imageUrl])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (title || serializedContent) {
        handleAutoSave()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [title, serializedContent, excerpt, category, tags, imageUrl, handleAutoSave])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = "Title is required"
    if (!blocksToPlainText(blocks).trim()) newErrors.content = "Content is required"
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
            content: serializedContent,
            excerpt,
            category,
            tags,
            image_url: imageUrl,
            published: publish ? true : post.published,
          })
        } else {
          await createPost({
            title,
            content: serializedContent,
            excerpt,
            category,
            tags,
            image_url: imageUrl,
            published: publish,
          })
          // Clear localStorage draft after successful create
          localStorage.removeItem("blog-draft")
        }

        router.push("/dashboard")
        router.refresh()
      } catch (e) {
        console.error("Failed to save post", e)
        setErrors({ submit: "Failed to save post. Please try again." })
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-foreground">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose || (() => router.push("/dashboard"))}
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
            blocks={blocks}
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
                <label className="block font-mono text-sm font-medium mb-1.5">Content Blocks</label>
                <BlockEditor blocks={blocks} onChange={setBlocks} />
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
                    <span className="font-mono">{wordCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Characters</span>
                    <span className="font-mono">{charCount}</span>
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

function BlockEditor({ blocks, onChange }: { blocks: Block[]; onChange: (blocks: Block[]) => void }) {
  const updateBlock = (id: string, data: Partial<Block>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...data } as Block : b)))
  }

  const removeBlock = (id: string) => {
    if (blocks.length === 1) return
    onChange(blocks.filter((b) => b.id !== id))
  }

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex((b) => b.id === id)
    if (index === -1) return
    const newBlocks = [...blocks]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= blocks.length) return
    ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
    onChange(newBlocks)
  }

  const addBlock = (type: Block["type"], options?: { variant?: Block["variant"]; ordered?: boolean }) => {
    const base: Block =
      type === "heading"
        ? { id: createId(), type: "heading", level: 2, text: "Heading" }
        : type === "code"
          ? { id: createId(), type: "code", language: "typescript", code: "// code" }
          : type === "quote"
            ? { id: createId(), type: "quote", text: "Quote", attribution: "" }
            : type === "callout"
              ? { id: createId(), type: "callout", variant: options?.variant || "idea", title: "Idea", text: "" }
              : type === "list"
                ? { id: createId(), type: "list", ordered: options?.ordered ?? false, items: ["List item"] }
                : type === "image"
                  ? { id: createId(), type: "image", url: "", alt: "", caption: "" }
                  : type === "divider"
                    ? { id: createId(), type: "divider" }
                    : { id: createId(), type: "paragraph", text: "" }
    onChange([...blocks, base])
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => (
        <div key={block.id} className="border-2 border-foreground rounded-sm bg-card shadow-xs">
          <div className="flex items-center justify-between px-3 py-2 border-b-2 border-foreground/30 bg-muted/40">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <GripVertical className="w-4 h-4" />
              <span>
                {idx + 1}. {block.type}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveBlock(block.id, "up")}
                className="p-1 hover:bg-secondary rounded-sm disabled:opacity-40"
                disabled={idx === 0}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveBlock(block.id, "down")}
                className="p-1 hover:bg-secondary rounded-sm disabled:opacity-40"
                disabled={idx === blocks.length - 1}
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                className="p-1 hover:bg-destructive/10 rounded-sm text-destructive"
                title="Delete block"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <BlockFields block={block} onChange={(data) => updateBlock(block.id, data)} />
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <AddBlockButton icon={Type} label="Paragraph" onClick={() => addBlock("paragraph")} />
        <AddBlockButton icon={HeadingIcon} label="Heading" onClick={() => addBlock("heading")} />
        <AddBlockButton icon={Code} label="Code" onClick={() => addBlock("code")} />
        <AddBlockButton icon={Quote} label="Quote" onClick={() => addBlock("quote")} />
        <AddBlockButton icon={Sparkles} label="Idea" onClick={() => addBlock("callout", { variant: "idea" })} />
        <AddBlockButton icon={Flame} label="Fun fact" onClick={() => addBlock("callout", { variant: "fun" })} />
        <AddBlockButton icon={List} label="List" onClick={() => addBlock("list", { ordered: false })} />
        <AddBlockButton icon={ListOrdered} label="Numbered" onClick={() => addBlock("list", { ordered: true })} />
        <AddBlockButton icon={ImageIcon} label="Image" onClick={() => addBlock("image")} />
        <AddBlockButton icon={Minus} label="Divider" onClick={() => addBlock("divider")} />
      </div>
    </div>
  )
}

function AddBlockButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary border-2 border-foreground rounded-sm font-mono text-xs hover:bg-secondary/80 transition-colors"
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  )
}

function BlockFields({ block, onChange }: { block: Block; onChange: (data: Partial<Block>) => void }) {
  if (block.type === "paragraph") {
    return (
      <textarea
        value={block.text}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Write your paragraph..."
        className="w-full min-h-[120px] px-3 py-2 bg-background border-2 border-foreground rounded-sm font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
    )
  }

  if (block.type === "heading") {
    return (
      <div className="space-y-2">
        <select
          value={block.level}
          onChange={(e) => onChange({ level: Number(e.target.value) as Block["level"] })}
          className="px-3 py-2 bg-background border-2 border-foreground rounded-sm font-mono text-xs"
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
        </select>
        <input
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Heading text"
          className="w-full px-3 py-2 bg-background border-2 border-foreground rounded-sm font-sans text-sm"
        />
      </div>
    )
  }

  if (block.type === "code") {
    return (
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          <input
            value={block.language}
            onChange={(e) => onChange({ language: e.target.value })}
            placeholder="Language"
            className="px-3 py-2 bg-background border-2 border-foreground rounded-sm font-mono text-xs"
          />
          <input
            value={block.caption || ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Filename / caption"
            className="flex-1 min-w-[180px] px-3 py-2 bg-background border-2 border-foreground rounded-sm font-mono text-xs"
          />
        </div>
        <textarea
          value={block.code}
          onChange={(e) => onChange({ code: e.target.value })}
          placeholder="Code..."
          className="w-full min-h-[180px] px-3 py-2 bg-background border-2 border-foreground rounded-sm font-mono text-sm"
          spellCheck={false}
        />
      </div>
    )
  }

  if (block.type === "quote") {
    return (
      <div className="space-y-2">
        <textarea
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Quote text"
          className="w-full min-h-[120px] px-3 py-2 bg-background border-2 border-foreground rounded-sm font-serif text-sm"
        />
        <input
          value={block.attribution || ""}
          onChange={(e) => onChange({ attribution: e.target.value })}
          placeholder="Attribution (optional)"
          className="w-full px-3 py-2 bg-background border-2 border-foreground rounded-sm font-mono text-xs"
        />
      </div>
    )
  }

  if (block.type === "callout") {
    return (
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          <select
            value={block.variant}
            onChange={(e) => onChange({ variant: e.target.value as Block["variant"] })}
            className="px-3 py-2 bg-background border-2 border-foreground rounded-sm font-mono text-xs"
          >
            <option value="idea">Idea</option>
            <option value="fun">Fun fact</option>
            <option value="note">Note</option>
            <option value="warn">Warning</option>
          </select>
          <input
            value={block.title || ""}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Title"
            className="flex-1 min-w-40 px-3 py-2 bg-background border-2 border-foreground rounded-sm font-mono text-xs"
          />
        </div>
        <textarea
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Callout text"
          className="w-full min-h-[120px] px-3 py-2 bg-background border-2 border-foreground rounded-sm text-sm"
        />
      </div>
    )
  }

  if (block.type === "list") {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <label className="inline-flex items-center gap-2 text-xs font-mono">
            <input
              type="checkbox"
              checked={block.ordered}
              onChange={(e) => onChange({ ordered: e.target.checked })}
              className="accent-foreground"
            />
            Ordered list
          </label>
        </div>
        <div className="space-y-2">
          {block.items.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newItems = [...block.items]
                  newItems[index] = e.target.value
                  onChange({ items: newItems })
                }}
                placeholder="List item..."
                className="flex-1 px-3 py-2 bg-background border-2 border-foreground rounded-sm font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => {
                  const newItems = block.items.filter((_, i) => i !== index)
                  onChange({ items: newItems })
                }}
                className="px-2 py-2 bg-destructive/20 border-2 border-destructive rounded-sm hover:bg-destructive/30 transition-colors"
                title="Remove item"
              >
                <X className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onChange({ items: [...block.items, ""] })}
          className="w-full px-3 py-2 bg-secondary border-2 border-foreground rounded-sm font-mono text-sm hover:bg-secondary/80 transition-colors"
        >
          + Add item
        </button>
      </div>
    )
  }

  if (block.type === "image") {
    return (
      <div className="space-y-2">
        <input
          value={block.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="Image URL"
          className="w-full px-3 py-2 bg-background border-2 border-foreground rounded-sm font-mono text-xs"
        />
        <div className="flex gap-2 flex-wrap">
          <input
            value={block.alt || ""}
            onChange={(e) => onChange({ alt: e.target.value })}
            placeholder="Alt text"
            className="flex-1 min-w-40 px-3 py-2 bg-background border-2 border-foreground rounded-sm font-mono text-xs"
          />
          <input
            value={block.caption || ""}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Caption"
            className="flex-1 min-w-40 px-3 py-2 bg-background border-2 border-foreground rounded-sm font-mono text-xs"
          />
        </div>
        {block.url && (
          <div className="relative aspect-video bg-muted rounded overflow-hidden border border-foreground/20">
            <img src={block.url} alt={block.alt || "preview"} className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    )
  }

  if (block.type === "divider") {
    return <div className="h-2" />
  }

  return null
}

function HeadingIcon(props: { className?: string }) {
  return <span className={cn("font-mono text-xs", props.className)}>H</span>
}

// Post Preview Component
function PostPreview({
  title,
  blocks,
  excerpt,
  category,
  tags,
  imageUrl,
  readingTime,
}: {
  title: string
  blocks: Block[]
  excerpt: string
  category: string
  tags: string[]
  imageUrl: string
  readingTime: string
}) {
  return (
    <article className="max-w-3xl mx-auto">
      <div className="bg-card border-2 border-foreground rounded-sm shadow-sm p-6 md:p-8 space-y-6">
        {/* Header */}
        <header className="space-y-3">
          {category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 border-2 border-foreground/50 rounded-sm font-mono text-xs mb-4 -rotate-1">
              {category}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title || "Untitled Post"}</h1>
          {excerpt && <p className="text-lg text-muted-foreground font-serif leading-relaxed">{excerpt}</p>}
          <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
            <span>{new Date().toLocaleDateString()}</span>
            <span className="text-primary">|</span>
            <span>{readingTime}</span>
          </div>
        </header>

        {/* Featured Image */}
        {imageUrl && (
          <div className="relative bg-white p-3 border-2 border-foreground/20 shadow-xs -rotate-1">
            <img src={imageUrl || "/placeholder.svg"} alt={title} className="w-full aspect-video object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {blocks.map((block) => (
            <BlockPreview key={block.id} block={block} />
          ))}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="pt-6 border-t-2 border-foreground/20">
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

function BlockPreview({ block }: { block: Block }) {
  const render = (text: string) => ({ __html: renderInlineMarkdown(text || "") })

  switch (block.type) {
    case "paragraph":
      return <p className="font-serif leading-relaxed text-base" dangerouslySetInnerHTML={render(block.text)} />
    case "heading": {
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements
      return <Tag className="font-bold text-2xl mt-4" dangerouslySetInnerHTML={render(block.text)} />
    }
    case "code":
      return <CodeBlock code={block.code} language={block.language} filename={block.caption} />
    case "quote":
      return (
        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
          <p dangerouslySetInnerHTML={render(block.text)} />
          {block.attribution && <p className="font-mono text-xs mt-2">— {block.attribution}</p>}
        </blockquote>
      )
    case "callout":
      return (
        <div
          className={cn(
            "p-4 border-2 rounded-sm",
            block.variant === "idea" && "border-primary/60 bg-primary/10",
            block.variant === "fun" && "border-accent/60 bg-accent/10",
            block.variant === "note" && "border-foreground/40 bg-muted/30",
            block.variant === "warn" && "border-destructive/60 bg-destructive/10",
          )}
        >
          <div
            className="font-mono text-xs uppercase tracking-wide mb-1"
            dangerouslySetInnerHTML={render(block.title || block.variant)}
          />
          <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={render(block.text)} />
        </div>
      )
    case "list":
      if (block.ordered) {
        return (
          <ol className="list-decimal pl-6 space-y-1">
            {block.items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={render(item)} />
            ))}
          </ol>
        )
      }
      return (
        <ul className="list-disc pl-6 space-y-1">
          {block.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={render(item)} />
          ))}
        </ul>
      )
    case "image":
      return (
        <figure className="space-y-2">
          <img
            src={block.url || "/placeholder.svg"}
            alt={block.alt || "image"}
            className="w-full rounded-sm border-2 border-foreground/40"
          />
          {(block.caption || block.alt) && (
            <figcaption
              className="text-xs text-muted-foreground font-mono"
              dangerouslySetInnerHTML={render(block.caption || block.alt || "")}
            />
          )}
        </figure>
      )
    case "divider":
      return <hr className="border-t-2 border-foreground/30 my-6" />
    default:
      return null
  }
}
