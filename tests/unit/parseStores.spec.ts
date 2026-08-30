import { describe, expect, it } from 'vitest'
import { StoreParseError, parseStore, parseStores } from '#shared/utils/parseStores'
import { WEEKDAYS } from '#shared/types/store'

function makeRawStore(overrides: Record<string, unknown> = {}) {
  return {
    storeId: '3126',
    name: 'Jumbo Eindhoven Nederlandplein',
    complexNumber: 33079,
    websiteURL: 'https://www.jumbo.com/winkel/eindhoven/jumbo-eindhoven-nederlandplein',
    facilities: { flowers: true, wifi: true, parking: 'FREE', locationType: 'SUPERMARKET' },
    commerce: {
      inStore: { available: true, availability: { startsOn: '2014-08-26T22:00:00Z', endsOn: '9999-12-31T00:00:00Z' } },
      homeDelivery: { available: true },
      collection: { available: false }
    },
    location: {
      latitude: 51.479272,
      longitude: 5.46338,
      address: {
        street: 'Nederlandplein',
        houseNumber: '103',
        postalCode: '5628AJ',
        city: 'EINDHOVEN',
        state: 'Noord-Brabant',
        countryCode: 'NL'
      }
    },
    openingHours: {
      monday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' },
      sunday: { opensAt: '10:00+01:00', closesAt: '20:00+01:00' }
    },
    ...overrides
  }
}

describe('parseStore', () => {
  it('maps a complete store record', () => {
    const store = parseStore(makeRawStore())

    expect(store).not.toBeNull()
    expect(store!.id).toBe('3126')
    expect(store!.name).toBe('Jumbo Eindhoven Nederlandplein')
    expect(store!.complexNumber).toBe(33079)
    expect(store!.websiteUrl).toContain('jumbo.com')
    expect(store!.coordinates).toEqual({ lat: 51.479272, lng: 5.46338 })
    expect(store!.address.street).toBe('Nederlandplein')
    expect(store!.address.houseNumber).toBe('103')
    expect(store!.address.city).toBe('EINDHOVEN')
    expect(store!.address.formatted).toBe('Nederlandplein 103')
  })

  it('tolerates a missing websiteURL', () => {
    const raw = makeRawStore()
    delete (raw as Record<string, unknown>).websiteURL

    const store = parseStore(raw)

    expect(store).not.toBeNull()
    expect(store!.websiteUrl).toBeUndefined()
  })

  it('splits the house number out of the street when houseNumber is missing', () => {
    const store = parseStore(
      makeRawStore({
        location: {
          latitude: 51.5,
          longitude: 5.5,
          address: { street: 'Hortensialaan 2', postalCode: '5582AA', city: 'AALST (NL)' }
        }
      })
    )

    expect(store!.address.street).toBe('Hortensialaan')
    expect(store!.address.houseNumber).toBe('2')
    expect(store!.address.formatted).toBe('Hortensialaan 2')
  })

  it('handles a house number with a letter suffix', () => {
    const store = parseStore(
      makeRawStore({
        location: {
          latitude: 51.5,
          longitude: 5.5,
          address: { street: 'Smits van Oyenlaan 2G', postalCode: '6026AA', city: 'MAARHEEZE' }
        }
      })
    )

    expect(store!.address.street).toBe('Smits van Oyenlaan')
    expect(store!.address.houseNumber).toBe('2G')
  })

  it('leaves a street without a trailing number untouched', () => {
    const store = parseStore(
      makeRawStore({
        location: {
          latitude: 51.5,
          longitude: 5.5,
          address: { street: 'Nederlandplein', postalCode: '5628AJ', city: 'EINDHOVEN' }
        }
      })
    )

    expect(store!.address.street).toBe('Nederlandplein')
    expect(store!.address.houseNumber).toBeUndefined()
    expect(store!.address.formatted).toBe('Nederlandplein')
  })

  it('maps 0,0 coordinates to null', () => {
    const store = parseStore(
      makeRawStore({
        location: { latitude: 0, longitude: 0, address: { street: 'Teststraat', city: 'VEGHEL' } }
      })
    )

    expect(store!.coordinates).toBeNull()
  })

  it('maps absent coordinates to null', () => {
    const store = parseStore(makeRawStore({ location: { address: { street: 'X', city: 'Y' } } }))

    expect(store!.coordinates).toBeNull()
  })

  it('fills in every weekday, leaving days without hours empty', () => {
    const store = parseStore(makeRawStore())

    expect(Object.keys(store!.openingHours)).toEqual([...WEEKDAYS])
    expect(store!.openingHours.monday).toEqual({ opensAt: '08:00+01:00', closesAt: '21:00+01:00' })
    expect(store!.openingHours.tuesday).toEqual({})
  })

  it('keeps a day that only has a closing time', () => {
    const store = parseStore(
      makeRawStore({ openingHours: { monday: { closesAt: '00:01+01:00' } } })
    )

    expect(store!.openingHours.monday).toEqual({ closesAt: '00:01+01:00' })
  })

  it('defaults missing facilities and commerce to safe values', () => {
    const raw = makeRawStore()
    delete (raw as Record<string, unknown>).facilities
    delete (raw as Record<string, unknown>).commerce

    const store = parseStore(raw)

    expect(store!.facilities.wifi).toBe(false)
    expect(store!.facilities.parking).toBeNull()
    expect(store!.commerce.homeDelivery).toEqual({ available: false, startsOn: null, endsOn: null })
  })

  it('returns null for records without an id or a name', () => {
    expect(parseStore(makeRawStore({ storeId: undefined }))).toBeNull()
    expect(parseStore(makeRawStore({ name: '' }))).toBeNull()
    expect(parseStore(null)).toBeNull()
    expect(parseStore('not a store')).toBeNull()
  })
})

describe('parseStores', () => {
  it('parses the envelope into a list of stores', () => {
    const stores = parseStores({ stores: [makeRawStore(), makeRawStore({ storeId: '3127' })] })

    expect(stores).toHaveLength(2)
    expect(stores.map((store) => store.id)).toEqual(['3126', '3127'])
  })

  it('skips unusable records rather than failing the whole dataset', () => {
    const stores = parseStores({ stores: [makeRawStore(), { storeId: '9999' }, null, 42] })

    expect(stores).toHaveLength(1)
    expect(stores[0]!.id).toBe('3126')
  })

  it('returns an empty list for an empty dataset', () => {
    expect(parseStores({ stores: [] })).toEqual([])
  })

  it('throws when the envelope is malformed', () => {
    expect(() => parseStores(null)).toThrow(StoreParseError)
    expect(() => parseStores({})).toThrow(StoreParseError)
    expect(() => parseStores({ stores: 'nope' })).toThrow(StoreParseError)
    expect(() => parseStores([])).toThrow(StoreParseError)
  })
})
