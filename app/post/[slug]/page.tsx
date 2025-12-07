import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CategoryTag } from "@/components/category-tag"
import { getPostBySlug, getPublishedPosts } from "@/lib/blog-actions"

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// Parse markdown to HTML
function parseMarkdown(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-muted p-4 rounded-sm overflow-x-auto border-2 border-foreground my-4 font-mono text-sm"><code>$2</code></pre>',
    )
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^### (.*)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^# (.*)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]$$([^)]+)$$/g,
      '<a href="$2" class="text-primary underline hover:no-underline" target="_blank" rel="noopener">$1</a>',
    )
    .replace(
      /!\[([^\]]*)\]$$([^)]+)$$/g,
      '<img src="$2" alt="$1" class="rounded-sm border-2 border-foreground my-4 max-w-full" />',
    )
    .replace(
      /^&gt; (.*)$/gm,
      '<blockquote class="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">$1</blockquote>',
    )
    .replace(/^---$/gm, '<hr class="border-t-2 border-foreground my-8" />')
    .replace(/^- (.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.*)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\n\n/g, '</p><p class="my-4 font-serif leading-relaxed">')
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post || !post.published) {
    notFound()
  }

  const htmlContent = parseMarkdown(post.content)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 py-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            back to chaos
          </Link>

          {/* Header */}
          <header className="mb-8">
            <CategoryTag category={post.category} size="md" />

            <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-4 leading-tight text-balance">{post.title}</h1>

            {/* Meta Info - Paper slip style */}
            <div className="flex flex-wrap items-center gap-4 p-3 bg-card border-2 border-foreground/50 rounded-sm font-mono text-sm">
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground">//</span>
                {new Date(post.created_at).toLocaleDateString()}
              </span>
              <span className="text-primary">|</span>
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground">~</span>
                {post.reading_time}
              </span>
              {post.tags.length > 0 && (
                <>
                  <span className="text-primary">|</span>
                  <div className="flex gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Featured Image - Polaroid style */}
          {post.image_url && (
            <div className="mb-8 p-3 bg-white dark:bg-card border-2 border-foreground shadow-sm rotate-[-0.5deg]">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={post.image_url || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground text-center">
                ~ a visual representation of the chaos ~
              </p>
            </div>
          )}

          {/* Doodle Divider */}
          <div className="flex justify-center mb-8">
            <svg className="w-32 h-4" viewBox="0 0 128 16">
              <path
                d="M0 8 L32 8 M40 8 L88 8 M96 8 L128 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-primary/60"
              />
              <circle cx="36" cy="8" r="3" fill="currentColor" className="text-accent" />
              <circle cx="92" cy="8" r="3" fill="currentColor" className="text-secondary" />
            </svg>
          </div>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            {/* Lead paragraph */}
            {post.excerpt && (
              <p className="text-xl font-serif text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>
            )}

            {/* Content */}
            <div
              className="space-y-4"
              dangerouslySetInnerHTML={{ __html: `<p class="my-4 font-serif leading-relaxed">${htmlContent}</p>` }}
            />
          </div>

          {/* Tags Footer */}
          <footer className="mt-12 pt-8 border-t-2 border-foreground/20">
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-secondary/50 border border-foreground/30 rounded-sm font-mono text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Navigation */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-mono font-medium border-2 border-foreground rounded-sm shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              more brain dumps
            </Link>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  )
}
