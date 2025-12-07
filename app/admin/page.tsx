import { getAllPosts, getCategories } from "@/lib/blog-actions"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Navbar } from "@/components/navbar"

export default async function AdminPage() {
  const [posts, categories] = await Promise.all([getAllPosts(), getCategories()])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <AdminDashboard posts={posts} categories={categories} />
    </div>
  )
}
