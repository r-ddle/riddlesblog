export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: string
  category: string
  tags: string[]
  image?: string
}

export const categories = [
  { name: "terminal therapy", emoji: "🧠", color: "bg-pink-200" },
  { name: "ecommerce chaos", emoji: "🛒", color: "bg-cyan-200" },
  { name: "debugging logs", emoji: "🐛", color: "bg-yellow-200" },
  { name: "random rants", emoji: "💭", color: "bg-green-200" },
  { name: "tech philosophy", emoji: "🔮", color: "bg-purple-200" },
]

export const blogPosts: BlogPost[] = [
  {
    slug: "debugging-my-mental-capacity",
    title: "Debugging My Mental Capacity at 3AM",
    excerpt:
      "A terminal therapy session where I question every life choice while fixing a bug that turned out to be a missing semicolon. Classic.",
    date: "2024-12-05",
    readingTime: "5 min",
    category: "terminal therapy",
    tags: ["debugging", "life", "3am-thoughts"],
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    slug: "sri-lanka-ecommerce-experiments",
    title: "Chaotic Sri Lanka Ecommerce Experiments Vol. 1",
    excerpt:
      "Building an ecommerce site in Sri Lanka is like playing Dark Souls on nightmare mode. Payment gateways? Never heard of her.",
    date: "2024-12-01",
    readingTime: "8 min",
    category: "ecommerce chaos",
    tags: ["ecommerce", "sri-lanka", "chaos"],
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    slug: "why-i-hate-css",
    title: "Why I Hate CSS (A Love Letter)",
    excerpt:
      "CSS and I have a complicated relationship. It's like dating someone who gaslights you but also makes everything look pretty.",
    date: "2024-11-28",
    readingTime: "4 min",
    category: "random rants",
    tags: ["css", "rant", "frontend"],
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    slug: "brain-dump-typescript",
    title: "Brain Dump 2.0: TypeScript Edition",
    excerpt: "Types are just spicy comments that yell at you. Change my mind. Actually, don't. I'm too tired.",
    date: "2024-11-25",
    readingTime: "6 min",
    category: "tech philosophy",
    tags: ["typescript", "philosophy", "brain-dump"],
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    slug: "the-bug-that-haunts-me",
    title: "The Bug That Still Haunts My Dreams",
    excerpt:
      "Three weeks. It took me three weeks to find a race condition that only appeared on Tuesdays. I'm not okay.",
    date: "2024-11-20",
    readingTime: "7 min",
    category: "debugging logs",
    tags: ["bugs", "horror-story", "race-condition"],
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    slug: "react-is-a-lifestyle",
    title: "React Is Not a Framework, It's a Lifestyle",
    excerpt: "You don't just use React. React uses you. Here's my descent into useEffect madness.",
    date: "2024-11-15",
    readingTime: "5 min",
    category: "tech philosophy",
    tags: ["react", "philosophy", "hooks"],
    image: "/placeholder.svg?height=400&width=600",
  },
]

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter((post) => post.category === category)
}

export function searchPosts(query: string): BlogPost[] {
  const lowerQuery = query.toLowerCase()
  return blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  )
}
