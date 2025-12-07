"use client"

import hljs from "highlight.js"
import "highlight.js/styles/atom-one-dark.css"

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export function CodeBlock({ code, language = "typescript", filename }: CodeBlockProps) {
  let highlightedCode = code
  try {
    if (language && hljs.getLanguage(language)) {
      highlightedCode = hljs.highlight(code, { language, ignoreIllegals: true }).value
    } else {
      highlightedCode = hljs.highlightAuto(code).value
    }
  } catch (err) {
    // Fallback to plain text if highlighting fails
    highlightedCode = code
  }

  return (
    <div className="my-6 relative">
      {/* Terminal-style header */}
      <div className="flex items-center justify-between px-4 py-2 bg-foreground text-background border-2 border-foreground rounded-t-sm">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 bg-destructive rounded-full" />
            <div className="w-3 h-3 bg-accent rounded-full" />
            <div className="w-3 h-3 bg-green-400 rounded-full" />
          </div>
          {filename && <span className="font-mono text-xs opacity-80">{filename}</span>}
        </div>
        <span className="font-mono text-xs opacity-60">{language}</span>
      </div>

      {/* Code content - sticky note style */}
      <pre className="p-4 bg-card border-2 border-foreground rounded-b-sm overflow-x-auto shadow-sm">
        <code
          className="font-mono text-sm"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  )
}
