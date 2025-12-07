"use server"

import { sql, type BlogPost, type Category, type BlogDraft } from "./db"
import { requireAdminSession } from "./auth"
import { revalidatePath } from "next/cache"

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Helper to estimate reading time
function extractPlainText(content: string): string {
  if (!content) return ""
  try {
    const parsed = JSON.parse(content)
    const blocks = Array.isArray(parsed?.blocks) ? parsed.blocks : Array.isArray(parsed) ? parsed : null
    if (blocks) {
      const textPieces = blocks.flatMap((block: any) => {
        switch (block.type) {
          case "paragraph":
          case "heading":
          case "quote":
          case "callout":
          case "idea":
          case "funfact":
            return [block.text || ""]
          case "list":
            return Array.isArray(block.items) ? block.items : []
          case "code":
            return [block.code || ""]
          default:
            return []
        }
      })
      return textPieces.join(" ").trim()
    }
  } catch (err) {
    // fall through to raw content
  }
  return content
}

function estimateReadingTime(content: string): string {
  const plain = extractPlainText(content)
  const wordsPerMinute = 200
  const words = plain.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))
  return `${minutes} min`
}

// Get all published posts
export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const posts = await sql`
      SELECT * FROM blog_posts
      WHERE published = true
      ORDER BY created_at DESC
    `
    return posts as BlogPost[]
  } catch (error: any) {
    if (error?.message?.includes("DATABASE_URL") || error?.message?.includes("not configured")) {
      console.warn("Database not configured, returning empty posts")
      return []
    }
    throw error
  }
}

// Get all posts (including drafts) for admin
export async function getAllPosts(): Promise<BlogPost[]> {
  await requireAdminSession()
  const posts = await sql`
    SELECT * FROM blog_posts
    ORDER BY created_at DESC
  `
  return posts as BlogPost[]
}

// Get single post by slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const posts = await sql`
      SELECT * FROM blog_posts
      WHERE slug = ${slug}
      LIMIT 1
    `
    return (posts[0] as BlogPost) || null
  } catch (error: any) {
    if (error?.message?.includes("DATABASE_URL") || error?.message?.includes("not configured")) {
      console.warn("Database not configured, returning null post")
      return null
    }
    throw error
  }
}

// Get posts by category
export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  try {
    const posts = await sql`
      SELECT * FROM blog_posts
      WHERE category = ${category} AND published = true
      ORDER BY created_at DESC
    `
    return posts as BlogPost[]
  } catch (error: any) {
    if (error?.message?.includes("DATABASE_URL") || error?.message?.includes("not configured")) {
      console.warn("Database not configured, returning empty posts")
      return []
    }
    throw error
  }
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await sql`
      SELECT * FROM categories
      ORDER BY name ASC
    `
    return categories as Category[]
  } catch (error: any) {
    if (error?.message?.includes("DATABASE_URL") || error?.message?.includes("not configured")) {
      console.warn("Database not configured, returning empty categories")
      return []
    }
    throw error
  }
}

// Create new post
export async function createPost(data: {
  title: string
  content: string
  excerpt?: string
  category: string
  tags?: string[]
  image_url?: string
  published?: boolean
}): Promise<BlogPost> {
  await requireAdminSession()
  const slug = generateSlug(data.title)
  const reading_time = estimateReadingTime(data.content)

  const posts = await sql`
    INSERT INTO blog_posts (slug, title, content, excerpt, category, tags, image_url, reading_time, published)
    VALUES (
      ${slug},
      ${data.title},
      ${data.content},
      ${data.excerpt || null},
      ${data.category},
      ${data.tags || []},
      ${data.image_url || null},
      ${reading_time},
      ${data.published || false}
    )
    RETURNING *
  `

  revalidatePath("/")
  revalidatePath("/categories")
  revalidatePath("/search")

  return posts[0] as BlogPost
}

// Update existing post
export async function updatePost(
  id: number,
  data: {
    title?: string
    content?: string
    excerpt?: string
    category?: string
    tags?: string[]
    image_url?: string
    published?: boolean
  },
): Promise<BlogPost> {
  await requireAdminSession()
  const slug = data.title ? generateSlug(data.title) : undefined
  const reading_time = data.content ? estimateReadingTime(data.content) : undefined

  const posts = await sql`
    UPDATE blog_posts
    SET
      title = COALESCE(${data.title ?? null}, title),
      slug = COALESCE(${slug ?? null}, slug),
      content = COALESCE(${data.content ?? null}, content),
      excerpt = COALESCE(${data.excerpt ?? null}, excerpt),
      category = COALESCE(${data.category ?? null}, category),
      tags = COALESCE(${data.tags ?? null}, tags),
      image_url = COALESCE(${data.image_url ?? null}, image_url),
      reading_time = COALESCE(${reading_time ?? null}, reading_time),
      published = COALESCE(${data.published ?? null}, published),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `

  revalidatePath("/")
  revalidatePath("/categories")
  revalidatePath("/search")
  revalidatePath(`/post/${posts[0].slug}`)

  return posts[0] as BlogPost
}

// Delete post
export async function deletePost(id: number): Promise<void> {
  await requireAdminSession()
  await sql`DELETE FROM blog_posts WHERE id = ${id}`

  revalidatePath("/")
  revalidatePath("/categories")
  revalidatePath("/search")
}

// Toggle publish status
export async function togglePublishStatus(id: number): Promise<BlogPost> {
  await requireAdminSession()
  const posts = await sql`
    UPDATE blog_posts
    SET published = NOT published, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `

  revalidatePath("/")
  revalidatePath("/categories")
  revalidatePath("/search")

  return posts[0] as BlogPost
}

// Save draft (auto-save)
export async function saveDraft(data: {
  post_id?: number
  title?: string
  content?: string
  excerpt?: string
  category?: string
  tags?: string[]
  image_url?: string
}): Promise<BlogDraft> {
  await requireAdminSession()
  if (data.post_id) {
    // Update existing draft
    const drafts = await sql`
      INSERT INTO blog_drafts (post_id, title, content, excerpt, category, tags, image_url)
      VALUES (${data.post_id}, ${data.title || null}, ${data.content || null}, ${data.excerpt || null}, ${data.category || null}, ${data.tags || []}, ${data.image_url || null})
      ON CONFLICT (post_id)
      DO UPDATE SET
        title = ${data.title || null},
        content = ${data.content || null},
        excerpt = ${data.excerpt || null},
        category = ${data.category || null},
        tags = ${data.tags || []},
        image_url = ${data.image_url || null},
        updated_at = NOW()
      RETURNING *
    `
    return drafts[0] as BlogDraft
  } else {
    // Create new draft without post_id
    const drafts = await sql`
      INSERT INTO blog_drafts (title, content, excerpt, category, tags, image_url)
      VALUES (${data.title || null}, ${data.content || null}, ${data.excerpt || null}, ${data.category || null}, ${data.tags || []}, ${data.image_url || null})
      RETURNING *
    `
    return drafts[0] as BlogDraft
  }
}

// Get draft for a post
export async function getDraft(postId: number): Promise<BlogDraft | null> {
  await requireAdminSession()
  const drafts = await sql`
    SELECT * FROM blog_drafts WHERE post_id = ${postId} LIMIT 1
  `
  return (drafts[0] as BlogDraft) || null
}

// Search posts with fuzzy matching
export async function searchPosts(query: string): Promise<BlogPost[]> {
  if (!query.trim()) return []

  // Use PostgreSQL full-text search with fuzzy matching
  const posts = await sql`
    SELECT *,
      ts_rank(
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, '')),
        plainto_tsquery('english', ${query})
      ) as rank,
      similarity(lower(title), lower(${query})) as title_sim
    FROM blog_posts
    WHERE published = true
      AND (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, ''))
        @@ plainto_tsquery('english', ${query})
        OR lower(title) LIKE ${`%${query.toLowerCase()}%`}
        OR lower(excerpt) LIKE ${`%${query.toLowerCase()}%`}
        OR EXISTS (
          SELECT 1 FROM unnest(tags) tag WHERE lower(tag) LIKE ${`%${query.toLowerCase()}%`}
        )
      )
    ORDER BY title_sim DESC, rank DESC, created_at DESC
  `
  return posts as BlogPost[]
}

// Add new category
export async function addCategory(data: { name: string; emoji?: string; color?: string }): Promise<Category> {
  await requireAdminSession()
  const categories = await sql`
    INSERT INTO categories (name, emoji, color)
    VALUES (${data.name}, ${data.emoji || null}, ${data.color || "bg-primary/20"})
    RETURNING *
  `
  return categories[0] as Category
}
