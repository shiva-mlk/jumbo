import type { Store } from '#shared/types/store'

export const DEFAULT_PAGE_SIZE = 12

// Lowers cases, removes diacritics, and collapses spaces for matching
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

// Combines name, city, street, and a spaceless postal code for searching
function haystack(store: Store): string {
  const base = normalize([store.name, store.address.city, store.address.street].join(' '))
  const postalCode = normalize(store.address.postalCode).replace(/\s+/g, '')

  return `${base} ${postalCode}`
}

// Splits the query into independent words so order does not matter
function toTerms(query: string): string[] {
  const normalized = normalize(query)
  return normalized ? normalized.split(' ') : []
}

// Returns stores containing all query terms in their searchable text
export function filterStores(stores: Store[], query: string): Store[] {
  const terms = toTerms(query)
  if (terms.length === 0) return stores

  return stores.filter((store) => {
    const text = haystack(store)
    return terms.every((term) => text.includes(term))
  })
}

export interface Suggestion {
  value: string
  type: 'city' | 'store'
}

// Returns deduplicated autocomplete suggestions (cities first, then stores)
export function getSuggestions(
  stores: Store[],
  query: string,
  limit: number = 10
): Suggestion[] {
  const terms = toTerms(query)
  if (terms.length === 0 || limit <= 0) return []

  const matches = (value: string) => {
    const text = normalize(value)
    return terms.every((term) => text.includes(term))
  }

  const suggestions: Suggestion[] = []
  const seen = new Set<string>()

  const add = (value: string, type: Suggestion['type']) => {
    const key = `${type}:${normalize(value)}`
    if (!value || seen.has(key) || suggestions.length >= limit) return
    seen.add(key)
    suggestions.push({ value, type })
  }

  for (const store of stores) {
    if (matches(store.address.city)) add(store.address.city, 'city')
  }

  for (const store of stores) {
    if (matches(store.name)) add(store.name, 'store')
  }

  return suggestions
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// Returns a slice of results, clamping out-of-bounds page numbers safely
export function paginate<T>(
  items: T[],
  page: number = 1,
  perPage: number = DEFAULT_PAGE_SIZE
): Page<T> {
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? Math.floor(perPage) : DEFAULT_PAGE_SIZE
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / safePerPage))
  const safePage = Number.isFinite(page) ? Math.min(Math.max(Math.floor(page), 1), totalPages) : 1
  const start = (safePage - 1) * safePerPage

  return {
    items: items.slice(start, start + safePerPage),
    total,
    page: safePage,
    perPage: safePerPage,
    totalPages
  }
}
