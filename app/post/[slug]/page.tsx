import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CategoryTag } from "@/components/category-tag"
import { CodeBlock } from "@/components/code-block"
import { getPostBySlug, blogPosts } from "@/lib/blog-data"

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

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
                <span className="text-muted-foreground">📅</span>
                {post.date}
              </span>
              <span className="text-primary">|</span>
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground">⏱️</span>
                {post.readingTime}
              </span>
              <span className="text-primary">|</span>
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </header>

          {/* Featured Image - Polaroid style */}
          {post.image && (
            <div className="mb-8 p-3 bg-white border-2 border-foreground shadow-sm rotate-[-0.5deg]">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground text-center">
                ~ a visual representation of my mental state ~
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
          <div className="prose prose-lg max-w-none">
            {/* Lead paragraph */}
            <p className="text-xl font-serif text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>

            {/* Sample content sections */}
            <h2 className="text-2xl font-bold mt-8 mb-4">The Context 🎭</h2>
            <p className="font-serif leading-relaxed mb-4">
              So there I was, staring at my screen at 3AM, wondering if the bug was in my code or in my life choices.
              Spoiler alert: it was both. The coffee had stopped working three hours ago, but I was too deep in the
              debugging session to care.
            </p>

            <CodeBlock
              code={`// This seemed like a good idea at 3AM
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const myLife = await sleep(Infinity);
// Why isn't this working?`}
              language="javascript"
              filename="existential-crisis.js"
            />

            <h2 className="text-2xl font-bold mt-8 mb-4">The Plot Thickens 🍿</h2>
            <p className="font-serif leading-relaxed mb-4">
              After six more cups of coffee and a deep philosophical conversation with my rubber duck, I finally found
              the issue. It was a missing semicolon. Classic JavaScript moment. The kind of bug that makes you question
              your entire career path.
            </p>

            {/* Sticky note callout */}
            <div className="my-8 p-4 bg-accent border-2 border-foreground rotate-1 shadow-sm">
              <p className="font-mono text-sm text-accent-foreground">
                <strong>💡 Pro tip:</strong> If you're debugging at 3AM, the bug is always something stupid. Go to
                sleep. It'll still be stupid tomorrow.
              </p>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">The Conclusion 🎬</h2>
            <p className="font-serif leading-relaxed mb-4">
              In the end, I fixed the bug, questioned my existence, and wrote this blog post to remind myself (and you)
              that we're all just improvising through code and life. The important thing is to keep shipping, keep
              learning, and keep the coffee brewing.
            </p>
          </div>

          {/* Tags Footer */}
          <footer className="mt-12 pt-8 border-t-2 border-foreground/20">
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

            {/* Navigation */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-mono font-medium border-2 border-foreground rounded-sm shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              ← more brain dumps
            </Link>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  )
}
