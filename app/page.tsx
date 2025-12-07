import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { PostCard } from "@/components/post-card"
import { SidebarCategories } from "@/components/sidebar-categories"
import { getPublishedPosts } from "@/lib/blog-actions"

export default async function HomePage() {
  const posts = await getPublishedPosts()

  const featuredPost = posts[0]
  const recentPosts = posts.slice(1)

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
              {featuredPost && (
                <section className="mb-12">
                  <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <span className="text-accent">*</span> latest brain dump
                  </h2>
                  <PostCard
                    post={{
                      slug: featuredPost.slug,
                      title: featuredPost.title,
                      excerpt: featuredPost.excerpt || "",
                      date: new Date(featuredPost.created_at).toLocaleDateString(),
                      readingTime: featuredPost.reading_time || "5 min",
                      category: featuredPost.category,
                      tags: featuredPost.tags,
                      image: featuredPost.image_url || undefined,
                    }}
                    featured
                  />
                </section>
              )}

              {/* Post Grid */}
              {recentPosts.length > 0 && (
                <section>
                  <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <span className="text-primary">//</span> recent posts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentPosts.map((post) => (
                      <PostCard
                        key={post.slug}
                        post={{
                          slug: post.slug,
                          title: post.title,
                          excerpt: post.excerpt || "",
                          date: new Date(post.created_at).toLocaleDateString(),
                          readingTime: post.reading_time || "5 min",
                          category: post.category,
                          tags: post.tags,
                          image: post.image_url || undefined,
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {posts.length === 0 && (
                <div className="text-center py-16 bg-card border-2 border-dashed border-foreground/50 rounded-sm">
                  <p className="font-mono text-muted-foreground text-lg mb-2">no posts yet</p>
                  <p className="font-serif text-sm text-muted-foreground">the void awaits your first brain dump</p>
                </div>
              )}
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
