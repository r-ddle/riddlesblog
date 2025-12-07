import { neon } from "@neondatabase/serverless"

const dbUrl = process.env.DATABASE_URL

// Only initialize if we have a valid connection string
export const sql = dbUrl && dbUrl !== "your_database_url_here"
  ? neon(dbUrl)
  : (async () => {
      throw new Error(
        "DATABASE_URL is not configured. Please set it in .env.local with a valid Neon connection string."
      )
    })

export interface BlogPost {
  id: number
  slug: string
  title: string
  content: string
  excerpt: string | null
  category: string
  tags: string[]
  image_url: string | null
  reading_time: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  emoji: string | null
  color: string
}

export interface BlogDraft {
  id: number
  post_id: number | null
  title: string | null
  content: string | null
  excerpt: string | null
  category: string | null
  tags: string[]
  image_url: string | null
  created_at: string
  updated_at: string
}
