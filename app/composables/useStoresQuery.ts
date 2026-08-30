import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import type { Address, OpeningHours } from '#shared/types/store'

export interface StoreListItem {
  id: string
  name: string
  websiteUrl?: string
  address: Pick<Address, 'formatted' | 'postalCode' | 'city'>
  openingHours: OpeningHours
}

export interface StorePage {
  items: StoreListItem[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

const STORES_QUERY = /* GraphQL */ `
  query Stores($query: String, $page: Int, $perPage: Int) {
    stores(query: $query, page: $page, perPage: $perPage) {
      total
      page
      perPage
      totalPages
      items {
        id
        name
        websiteUrl
        address {
          postalCode
          city
          formatted
        }
        openingHours {
          monday { opensAt closesAt }
          tuesday { opensAt closesAt }
          wednesday { opensAt closesAt }
          thursday { opensAt closesAt }
          friday { opensAt closesAt }
          saturday { opensAt closesAt }
          sunday { opensAt closesAt }
        }
      }
    }
  }
`

interface GraphQLResponse<T> {
  data?: T
  errors?: { message: string }[]
}

// Sends a GraphQL query to the server and returns the data or throws an error.
export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const response = await $fetch<GraphQLResponse<T>>('/api/graphql', {
    method: 'POST',
    body: { query, variables }
  })

  if (response.errors?.length) {
    throw new Error(response.errors.map((error) => error.message).join(', '))
  }

  if (!response.data) {
    throw new Error('The server returned no data.')
  }

  return response.data
}

export function useStoresQuery(query: Ref<string>, page: Ref<number>) {
  return useQuery({
    queryKey: ['stores', query, page],
    queryFn: () =>
      graphqlRequest<{ stores: StorePage }>(STORES_QUERY, {
        query: query.value,
        page: page.value
      }).then((data) => data.stores),
    placeholderData: keepPreviousData
  })
}
