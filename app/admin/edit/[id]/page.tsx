import { BlogEditor } from "@/components/blog-editor"
import { sql } from "@/lib/db"
import { notFound } from "next/navigation"
import type { BlogPost } from "@/lib/db"

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const postId = Number.parseInt(id, 10)

  if (isNaN(postId)) {
    notFound()
  }

  const posts = await sql`SELECT * FROM blog_posts WHERE id = ${postId} LIMIT 1`

  if (!posts.length) {
    notFound()
  }

  return <BlogEditor post={posts[0] as BlogPost} />
}
