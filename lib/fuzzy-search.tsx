// Fuzzy search implementation using Levenshtein distance and scoring

interface FuzzyResult<T> {
  item: T
  score: number
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function similarity(a: string, b: string): number {
  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()

  // Exact match
  if (aLower === bLower) return 1

  // Contains match (boosted)
  if (aLower.includes(bLower)) return 0.9
  if (bLower.includes(aLower)) return 0.85

  // Word boundary match
  const aWords = aLower.split(/\s+/)
  const bWords = bLower.split(/\s+/)
  let wordMatchScore = 0

  for (const bWord of bWords) {
    for (const aWord of aWords) {
      if (aWord.startsWith(bWord) || bWord.startsWith(aWord)) {
        wordMatchScore += 0.3
      }
    }
  }

  if (wordMatchScore > 0) {
    return Math.min(0.8, 0.5 + wordMatchScore)
  }

  // Levenshtein-based similarity
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1

  const distance = levenshteinDistance(aLower, bLower)
  return Math.max(0, 1 - distance / maxLen)
}

/**
 * Fuzzy search through items
 */
export function fuzzySearch<T>(items: T[], query: string, getSearchableText: (item: T) => string[]): FuzzyResult<T>[] {
  if (!query.trim()) return []

  const queryLower = query.toLowerCase().trim()
  const results: FuzzyResult<T>[] = []

  for (const item of items) {
    const searchableTexts = getSearchableText(item)
    let maxScore = 0

    for (const text of searchableTexts) {
      if (!text) continue

      const textLower = text.toLowerCase()

      // Direct contains check (highest priority)
      if (textLower.includes(queryLower)) {
        const score = 0.9 + (queryLower.length / textLower.length) * 0.1
        maxScore = Math.max(maxScore, score)
      }
      // Word starts with query
      else if (
        textLower.split(/\s+/).some((word) => word.startsWith(queryLower) || queryLower.startsWith(word.slice(0, 3)))
      ) {
        maxScore = Math.max(maxScore, 0.75)
      }
      // Fuzzy similarity
      else {
        const simScore = similarity(text, query)
        if (simScore > 0.4) {
          maxScore = Math.max(maxScore, simScore * 0.7)
        }
      }
    }

    if (maxScore > 0.3) {
      results.push({ item, score: maxScore })
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score)
}

/**
 * Highlight matching parts of text
 */
export function highlightMatches(text: string, query: string): string {
  if (!query.trim() || !text) return text

  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()

  // Find all occurrences
  const matches: { start: number; end: number }[] = []
  let index = 0

  while ((index = textLower.indexOf(queryLower, index)) !== -1) {
    matches.push({ start: index, end: index + query.length })
    index += 1
  }

  // Also check for word starts
  const queryWords = queryLower.split(/\s+/)
  const textWords = text.split(/\s+/)
  let currentIndex = 0

  for (const word of textWords) {
    const wordLower = word.toLowerCase()
    for (const qWord of queryWords) {
      if (wordLower.startsWith(qWord) && qWord.length >= 2) {
        const startIndex = text.indexOf(word, currentIndex)
        if (startIndex !== -1) {
          matches.push({ start: startIndex, end: startIndex + qWord.length })
        }
      }
    }
    currentIndex += word.length + 1
  }

  if (matches.length === 0) return text

  // Merge overlapping matches
  matches.sort((a, b) => a.start - b.start)
  const merged: { start: number; end: number }[] = []

  for (const match of matches) {
    if (merged.length === 0 || merged[merged.length - 1].end < match.start) {
      merged.push(match)
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, match.end)
    }
  }

  // Build highlighted string
  let result = ""
  let lastEnd = 0

  for (const match of merged) {
    result += escapeHtml(text.slice(lastEnd, match.start))
    result += `<mark class="bg-primary/30 text-foreground px-0.5 rounded">${escapeHtml(text.slice(match.start, match.end))}</mark>`
    lastEnd = match.end
  }

  result += escapeHtml(text.slice(lastEnd))
  return result
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}
