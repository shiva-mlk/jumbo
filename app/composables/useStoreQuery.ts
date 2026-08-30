import { useQuery } from '@tanstack/vue-query'
import type { Store } from '#shared/types/store'

const STORE_QUERY = /* GraphQL */ `
  query Store($id: ID!) {
    store(id: $id) {
      id
      name
      complexNumber
      websiteUrl
      address {
        street
        houseNumber
        postalCode
        city
        state
        countryCode
        formatted
      }
      coordinates {
        lat
        lng
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
      facilities {
        cookingStudio
        dryCleaning
        flowers
        kitchen
        liquorService
        locationType
        parking
        pharmacy
        photoService
        pickUpType
        postOffice
        selfCheckout
        selfScan
        wifi
      }
      commerce {
        inStore { available }
        homeDelivery { available }
        collection { available }
      }
    }
  }
`

export function useStoreQuery(id: Ref<string>) {
  return useQuery({
    queryKey: ['store', id],
    queryFn: () =>
      graphqlRequest<{ store: Store | null }>(STORE_QUERY, { id: id.value }).then(
        (data) => data.store
      )
  })
}
