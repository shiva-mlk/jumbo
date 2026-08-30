import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PAGE_SIZE,
  filterStores,
  getSuggestions,
  normalize,
  paginate
} from '#shared/utils/filterStores'
import { WEEKDAYS, type OpeningHours, type Store } from '#shared/types/store'

function emptyHours(): OpeningHours {
  const hours = {} as OpeningHours
  for (const day of WEEKDAYS) hours[day] = {}
  return hours
}

function makeStore(
  overrides: Partial<Store> & {
    city?: string
    street?: string
    postalCode?: string
  } = {}
): Store {
  const {
    city = 'EINDHOVEN',
    street = 'Nederlandplein',
    postalCode = '5628AJ',
    ...rest
  } = overrides

  return {
    id: '3126',
    name: 'Jumbo Eindhoven Nederlandplein',
    complexNumber: null,
    address: {
      street,
      houseNumber: '103',
      postalCode,
      city,
      state: 'Noord-Brabant',
      countryCode: 'NL',
      formatted: `${street} 103`
    },
    coordinates: null,
    openingHours: emptyHours(),
    facilities: {
      cookingStudio: false,
      dryCleaning: false,
      flowers: false,
      kitchen: false,
      liquorService: false,
      locationType: null,
      parking: null,
      pharmacy: false,
      photoService: false,
      pickUpType: null,
      postOffice: false,
      selfCheckout: false,
      selfScan: false,
      wifi: false
    },
    commerce: {
      inStore: { available: false, startsOn: null, endsOn: null },
      homeDelivery: { available: false, startsOn: null, endsOn: null },
      collection: { available: false, startsOn: null, endsOn: null }
    },
    ...rest
  }
}

const STORES: Store[] = [
  makeStore(),
  makeStore({
    id: '2',
    name: 'Jumbo Kollum Voorstraat',
    city: 'KOLLUM',
    street: 'Voorstraat',
    postalCode: '9291 AB'
  }),
  makeStore({
    id: '3',
    name: 'Jumbo Veghel Rijksweg',
    city: 'VEGHEL',
    street: 'Rijksweg',
    postalCode: '5461XX'
  }),
  makeStore({
    id: '4',
    name: 'Jumbo Eindhoven Woensel',
    city: 'EINDHOVEN',
    street: 'Winkelcentrum',
    postalCode: '5623EE'
  })
]

describe('normalize', () => {
  it('lowercases', () => {
    expect(normalize('EINDHOVEN')).toBe('eindhoven')
  })

  it('strips diacritics so accented input still matches', () => {
    expect(normalize('kollúm')).toBe('kollum')
    expect(normalize('Sint-Oedenrode')).toBe('sint-oedenrode')
    expect(normalize('ë')).toBe('e')
  })

  it('collapses and trims whitespace', () => {
    expect(normalize('  jumbo   eindhoven  ')).toBe('jumbo eindhoven')
  })
})

describe('filterStores', () => {
  it('returns everything for a blank query', () => {
    expect(filterStores(STORES, '')).toHaveLength(4)
    expect(filterStores(STORES, '   ')).toHaveLength(4)
  })

  it('matches on city regardless of case', () => {
    expect(filterStores(STORES, 'eindhoven')).toHaveLength(2)
    expect(filterStores(STORES, 'EINDHOVEN')).toHaveLength(2)
  })

  it('matches on store name', () => {
    const result = filterStores(STORES, 'woensel')
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('4')
  })

  it('matches on street', () => {
    const result = filterStores(STORES, 'rijksweg')
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('3')
  })

  it('matches accented input against plain data', () => {
    expect(filterStores(STORES, 'kollúm')).toHaveLength(1)
  })

  it('requires every term to match, so extra words narrow the results', () => {
    expect(filterStores(STORES, 'jumbo')).toHaveLength(4)
    expect(filterStores(STORES, 'jumbo eindhoven')).toHaveLength(2)
    expect(filterStores(STORES, 'jumbo eindhoven woensel')).toHaveLength(1)
  })

  it('ignores term order', () => {
    expect(filterStores(STORES, 'nederlandplein eindhoven')).toHaveLength(1)
    expect(filterStores(STORES, 'eindhoven nederlandplein')).toHaveLength(1)
  })

  it('returns nothing when a term matches no store', () => {
    expect(filterStores(STORES, 'amsterdam')).toHaveLength(0)
    expect(filterStores(STORES, 'eindhoven amsterdam')).toHaveLength(0)
  })

  it('matches on postal code without a space', () => {
    const result = filterStores(STORES, '5628AJ')
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('3126')
  })

  it('matches a spaced postal code typed either way', () => {
    expect(filterStores(STORES, '9291 AB')).toHaveLength(1)
    expect(filterStores(STORES, '9291AB')).toHaveLength(1)
  })

  it('matches an unspaced postal code typed with a space', () => {
    expect(filterStores(STORES, '5628 AJ')).toHaveLength(1)
  })

  it('matches on a postal code prefix', () => {
    // 5628AJ and 5623EE share the "562" prefix; 5461XX and 9291 AB do not.
    expect(filterStores(STORES, '562')).toHaveLength(2)
    expect(filterStores(STORES, '5628')).toHaveLength(1)
  })

  it('handles an empty store list', () => {
    expect(filterStores([], 'eindhoven')).toEqual([])
  })
})

describe('getSuggestions', () => {
  it('returns nothing for a blank query', () => {
    expect(getSuggestions(STORES, '')).toEqual([])
  })

  it('suggests matching cities before store names', () => {
    const suggestions = getSuggestions(STORES, 'eindhoven')

    expect(suggestions[0]).toEqual({ value: 'EINDHOVEN', type: 'city' })
    expect(suggestions.slice(1).every((s) => s.type === 'store')).toBe(true)
  })

  it('deduplicates cities shared by several stores', () => {
    const cities = getSuggestions(STORES, 'eindhoven').filter(
      (s) => s.type === 'city'
    )

    expect(cities).toHaveLength(1)
  })

  it('suggests store names when only a name matches', () => {
    expect(getSuggestions(STORES, 'woensel')).toEqual([
      { value: 'Jumbo Eindhoven Woensel', type: 'store' }
    ])
  })

  it('caps the number of suggestions', () => {
    expect(getSuggestions(STORES, 'jumbo', 2)).toHaveLength(2)
    expect(getSuggestions(STORES, 'jumbo', 0)).toEqual([])
  })

  it('returns nothing when nothing matches', () => {
    expect(getSuggestions(STORES, 'amsterdam')).toEqual([])
  })
})

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, index) => index + 1)

  it('returns the first page by default', () => {
    const page = paginate(items, 1, 10)

    expect(page.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(page).toMatchObject({
      total: 25,
      page: 1,
      perPage: 10,
      totalPages: 3
    })
  })

  it('returns a middle page', () => {
    expect(paginate(items, 2, 10).items).toEqual([
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20
    ])
  })

  it('returns a partial last page', () => {
    expect(paginate(items, 3, 10).items).toEqual([21, 22, 23, 24, 25])
  })

  it('clamps a page below the first one', () => {
    expect(paginate(items, 0, 10).page).toBe(1)
    expect(paginate(items, -5, 10).page).toBe(1)
  })

  it('clamps a page beyond the last one', () => {
    const page = paginate(items, 99, 10)

    expect(page.page).toBe(3)
    expect(page.items).toEqual([21, 22, 23, 24, 25])
  })

  it('reports one page for an empty list', () => {
    expect(paginate([], 1, 10)).toEqual({
      items: [],
      total: 0,
      page: 1,
      perPage: 10,
      totalPages: 1
    })
  })

  it('falls back to the default size for an invalid perPage', () => {
    expect(paginate(items, 1, 0).perPage).toBe(DEFAULT_PAGE_SIZE)
    expect(paginate(items, 1, -3).perPage).toBe(DEFAULT_PAGE_SIZE)
  })

  it('uses the default page size when none is given', () => {
    expect(paginate(items).perPage).toBe(DEFAULT_PAGE_SIZE)
  })
})
