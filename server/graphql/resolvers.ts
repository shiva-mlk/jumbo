import type { Store } from '#shared/types/store'
import { parseStores } from '#shared/utils/parseStores'
import {
  DEFAULT_PAGE_SIZE,
  filterStores,
  getSuggestions,
  paginate
} from '#shared/utils/filterStores'
import storeData from '#server/data/stores.json'

// Cached in memory so we don't re parse the 800+ records JSON on every keystroke.
let cache: Store[] | undefined

export function getStores(): Store[] {
  if (!cache) cache = parseStores(storeData)
  return cache
}

// Hard limit to prevent fetching the entire dataset at once.
const MAX_PAGE_SIZE = 100

interface StoresArgs {
  query?: string | null
  page?: number | null
  perPage?: number | null
}

interface StoreArgs {
  id: string
}

interface SuggestionsArgs {
  query: string
  limit?: number | null
}

export const resolvers = {
  SuggestionType: {
    CITY: 'city',
    STORE: 'store'
  },

  Query: {
    stores: (_parent: unknown, args: StoresArgs) => {
      const filtered = filterStores(getStores(), args.query ?? '')
      const perPage = Math.min(args.perPage ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)

      return paginate(filtered, args.page ?? 1, perPage)
    },

    store: (_parent: unknown, args: StoreArgs) => {
      return getStores().find((store) => store.id === args.id) ?? null
    },

    suggestions: (_parent: unknown, args: SuggestionsArgs) => {
      return getSuggestions(getStores(), args.query, args.limit ?? 10)
    }
  }
}
