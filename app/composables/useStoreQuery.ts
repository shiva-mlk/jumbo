import { useQuery } from '@tanstack/vue-query'
import type { Address, Commerce, Coordinates, Facilities, OpeningHours } from '#shared/types/store'

export interface StoreDetail {
  id: string
  name: string
  websiteUrl?: string
  address: Pick<Address, 'formatted' | 'postalCode' | 'city'>
  coordinates: Coordinates | null
  openingHours: OpeningHours
  facilities: Facilities
  commerce: Commerce
}

const STORE_QUERY = /* GraphQL */ `
  query Store($id: ID!) {
    store(id: $id) {
      id
      name
      websiteUrl
      address {
        postalCode
        city
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
      graphqlRequest<{ store: StoreDetail | null }>(STORE_QUERY, { id: id.value }).then(
        (data) => data.store
      )
  })
}
