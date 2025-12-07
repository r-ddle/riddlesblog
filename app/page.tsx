import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { PostCard } from "@/components/post-card"
import { SidebarCategories } from "@/components/sidebar-categories"
import { blogPosts } from "@/lib/blog-data"

export default function HomePage() {
  const featuredPost = blogPosts[0]
  const recentPosts = blogPosts.slice(1)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <HeroSection />

        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Featured Post */}
              <section className="mb-12">
                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <span className="text-accent">⭐</span> latest brain dump
                </h2>
                <PostCard post={featuredPost} featured />
              </section>

              {/* Post Grid */}
              <section>
                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <span className="text-primary">📝</span> recent posts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentPosts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <SidebarCategories />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
