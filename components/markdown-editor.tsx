"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  ImageIcon,
  Minus,
  Eye,
  EyeOff,
  Undo,
  Redo,
  Save,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onSave?: () => void
  placeholder?: string
  className?: string
}

export function MarkdownEditor({
  value,
  onChange,
  onSave,
  placeholder = "Start writing...",
  className,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Update history when value changes from parent
  useEffect(() => {
    if (value !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(value)
      setHistory(newHistory.slice(-50)) // Keep last 50 states
      setHistoryIndex(newHistory.length - 1)
    }
  }, [value, history, historyIndex])

  const insertMarkdown = useCallback(
    (before: string, after = "", placeholder = "") => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = value.substring(start, end) || placeholder
      const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end)

      onChange(newValue)

      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        const newCursorPos = start + before.length + (selectedText === placeholder ? 0 : selectedText.length)
        textarea.setSelectionRange(newCursorPos, newCursorPos + (selectedText === placeholder ? placeholder.length : 0))
      }, 0)
    },
    [value, onChange],
  )

  const insertAtLineStart = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const lineStart = value.lastIndexOf("\n", start - 1) + 1
      const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart)

      onChange(newValue)

      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + prefix.length, start + prefix.length)
      }, 0)
    },
    [value, onChange],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      onChange(history[historyIndex - 1])
    }
  }, [historyIndex, history, onChange])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      onChange(history[historyIndex + 1])
    }
  }, [historyIndex, history, onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault()
        insertMarkdown("  ")
      }
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault()
            insertMarkdown("**", "**", "bold text")
            break
          case "i":
            e.preventDefault()
            insertMarkdown("*", "*", "italic text")
            break
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case "s":
            e.preventDefault()
            onSave?.()
            break
        }
      }
    },
    [insertMarkdown, undo, redo, onSave],
  )

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown("**", "**", "bold"), title: "Bold (Ctrl+B)" },
    { icon: Italic, action: () => insertMarkdown("*", "*", "italic"), title: "Italic (Ctrl+I)" },
    { separator: true },
    { icon: Heading1, action: () => insertAtLineStart("# "), title: "Heading 1" },
    { icon: Heading2, action: () => insertAtLineStart("## "), title: "Heading 2" },
    { icon: Heading3, action: () => insertAtLineStart("### "), title: "Heading 3" },
    { separator: true },
    { icon: List, action: () => insertAtLineStart("- "), title: "Bullet List" },
    { icon: ListOrdered, action: () => insertAtLineStart("1. "), title: "Numbered List" },
    { icon: Quote, action: () => insertAtLineStart("> "), title: "Blockquote" },
    { separator: true },
    { icon: Code, action: () => insertMarkdown("`", "`", "code"), title: "Inline Code" },
    {
      icon: Code,
      action: () => insertMarkdown("```javascript\n", "\n```", "// code here"),
      title: "Code Block",
      isBlock: true,
    },
    { separator: true },
    { icon: Link, action: () => insertMarkdown("[", "](url)", "link text"), title: "Link" },
    { icon: ImageIcon, action: () => insertMarkdown("![", "](url)", "alt text"), title: "Image" },
    { icon: Minus, action: () => insertMarkdown("\n---\n"), title: "Horizontal Rule" },
  ]

  return (
    <div className={cn("border-2 border-foreground rounded-sm overflow-hidden bg-card", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b-2 border-foreground bg-muted/50 flex-wrap">
        {/* Undo/Redo */}
        <button
          type="button"
          onClick={undo}
          disabled={historyIndex === 0}
          className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={historyIndex === history.length - 1}
          className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-foreground/20 mx-1" />

        {toolbarButtons.map((btn, i) =>
          btn.separator ? (
            <div key={i} className="w-px h-6 bg-foreground/20 mx-1" />
          ) : (
            <button
              key={i}
              type="button"
              onClick={btn.action}
              className="p-1.5 rounded hover:bg-secondary transition-colors"
              title={btn.title}
            >
              {btn.icon && <btn.icon className={cn("w-4 h-4", btn.isBlock && "rotate-90")} />}
            </button>
          ),
        )}

        <div className="flex-1" />

        {/* Preview Toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded text-sm font-mono transition-colors",
            showPreview ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
          )}
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? "Edit" : "Preview"}
        </button>

        {onSave && (
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-sm font-mono bg-accent text-accent-foreground hover:opacity-90 transition-opacity ml-1"
            title="Save (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        )}
      </div>

      {/* Editor/Preview Area */}
      <div className="min-h-[400px]">
        {showPreview ? (
          <div className="p-4 prose prose-sm max-w-none dark:prose-invert">
            <MarkdownPreview content={value} />
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-full min-h-[400px] p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
            spellCheck={false}
          />
        )}
      </div>
    </div>
  )
}

// Simple markdown preview component
function MarkdownPreview({ content }: { content: string }) {
  const html = parseMarkdown(content)
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

// Basic markdown parser
function parseMarkdown(markdown: string): string {
  let html = markdown
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // Code blocks (must come before other transformations)
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-muted p-4 rounded-sm overflow-x-auto border-2 border-foreground my-4"><code class="text-sm">$2</code></pre>',
    )

    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')

    // Headings
    .replace(/^### (.*)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^# (.*)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')

    // Bold and Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")

    // Links
    .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>')

    // Images
    .replace(
      /!\[([^\]]*)\]$$([^)]+)$$/g,
      '<img src="$2" alt="$1" class="rounded-sm border-2 border-foreground my-4" />',
    )

    // Blockquotes
    .replace(
      /^&gt; (.*)$/gm,
      '<blockquote class="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">$1</blockquote>',
    )

    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-t-2 border-foreground my-8" />')

    // Unordered lists
    .replace(/^- (.*)$/gm, '<li class="ml-4">$1</li>')

    // Ordered lists
    .replace(/^\d+\. (.*)$/gm, '<li class="ml-4 list-decimal">$1</li>')

    // Paragraphs (simple approach)
    .replace(/\n\n/g, "</p><p class='my-4'>")

  // Wrap in paragraph
  html = `<p class='my-4'>${html}</p>`

  // Clean up empty paragraphs
  html = html.replace(/<p class='my-4'>\s*<\/p>/g, "")

  return html
}
