import { keepPreviousData, useQuery } from '@tanstack/vue-query'

export interface Suggestion {
  value: string
  type: 'CITY' | 'STORE'
}

const SUGGESTIONS_QUERY = /* GraphQL */ `
  query Suggestions($query: String!, $limit: Int) {
    suggestions(query: $query, limit: $limit) {
      value
      type
    }
  }
`

export const MIN_SUGGESTION_LENGTH = 2

export function useSuggestionsQuery(query: Ref<string>, limit: number = 8) {
  const enabled = computed(() => query.value.trim().length >= MIN_SUGGESTION_LENGTH)

  return useQuery({
    queryKey: ['suggestions', query],
    queryFn: () =>
      graphqlRequest<{ suggestions: Suggestion[] }>(SUGGESTIONS_QUERY, {
        query: query.value,
        limit
      }).then((data) => data.suggestions),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000
  })
}
