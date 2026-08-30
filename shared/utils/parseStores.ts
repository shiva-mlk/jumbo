import {
  WEEKDAYS,
  type Address,
  type Commerce,
  type CommerceChannel,
  type Coordinates,
  type Facilities,
  type OpeningHours,
  type OpeningHoursDay,
  type RawCommerceChannel,
  type RawStore,
  type Store,
  type Weekday
} from '../types/store'
import { asBoolean, asString, isObject } from './guards'

// Thrown when the top-level store data structure is invalid
export class StoreParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoreParseError'
  }
}

// Normalizes address fields and extracts house numbers merged into street names
function parseAddress(raw: RawStore['location']): Address {
  const address = raw?.address ?? {}
  const rawStreet = asString(address.street) ?? ''
  const rawHouseNumber = asString(address.houseNumber)

  let street = rawStreet
  let houseNumber = rawHouseNumber

  if (!houseNumber) {
    const match = rawStreet.match(
      /^(.*?)\s+(\d+\s*[a-zA-Z]?(?:[-/]\s*\d+\s*[a-zA-Z]?)?)$/
    )
    if (match?.[1] && match[2]) {
      street = match[1].trim()
      houseNumber = match[2].replace(/\s+/g, '')
    }
  }

  const formatted = [street, houseNumber].filter(Boolean).join(' ')

  return {
    street,
    ...(houseNumber ? { houseNumber } : {}),
    postalCode: asString(address.postalCode) ?? '',
    city: asString(address.city) ?? '',
    state: asString(address.state) ?? '',
    countryCode: asString(address.countryCode) ?? '',
    formatted
  }
}

// Validates coordinates and filters out invalid or (0,0) fallback values
function parseCoordinates(raw: RawStore['location']): Coordinates | null {
  const lat = raw?.latitude
  const lng = raw?.longitude

  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat === 0 && lng === 0) return null

  return { lat, lng }
}

// Normalizes opening hours for all 7 days with safe defaults
function parseOpeningHours(raw: RawStore['openingHours']): OpeningHours {
  const hours = {} as OpeningHours

  for (const day of WEEKDAYS) {
    const value = raw?.[day]
    const parsed: OpeningHoursDay = {}

    if (isObject(value)) {
      const opensAt = asString(value.opensAt)
      const closesAt = asString(value.closesAt)
      if (opensAt) parsed.opensAt = opensAt
      if (closesAt) parsed.closesAt = closesAt
    }

    hours[day as Weekday] = parsed
  }

  return hours
}

// Normalizes store facilities into explicit boolean and string values
function parseFacilities(raw: RawStore['facilities']): Facilities {
  const f = raw ?? {}
  return {
    cookingStudio: asBoolean(f.cookingStudio),
    dryCleaning: asBoolean(f.dryCleaning),
    flowers: asBoolean(f.flowers),
    kitchen: asBoolean(f.kitchen),
    liquorService: asBoolean(f.liquorService),
    locationType: asString(f.locationType) ?? null,
    parking: asString(f.parking) ?? null,
    pharmacy: asBoolean(f.pharmacy),
    photoService: asBoolean(f.photoService),
    pickUpType: asString(f.pickUpType) ?? null,
    postOffice: asBoolean(f.postOffice),
    selfCheckout: asBoolean(f.selfCheckout),
    selfScan: asBoolean(f.selfScan),
    wifi: asBoolean(f.wifi)
  }
}

// Extracts availability and valid dates for a single commerce channel
function parseCommerceChannel(
  raw: RawCommerceChannel | undefined
): CommerceChannel {
  return {
    available: asBoolean(raw?.available),
    startsOn: asString(raw?.availability?.startsOn) ?? null,
    endsOn: asString(raw?.availability?.endsOn) ?? null
  }
}

// Normalizes all store commerce channels
function parseCommerce(raw: RawStore['commerce']): Commerce {
  return {
    inStore: parseCommerceChannel(raw?.inStore),
    homeDelivery: parseCommerceChannel(raw?.homeDelivery),
    collection: parseCommerceChannel(raw?.collection)
  }
}

// Normalizes a single store record, skipping entries missing an ID or name
export function parseStore(raw: unknown): Store | null {
  if (!isObject(raw)) return null

  const store = raw as RawStore
  const id = asString(store.storeId)
  const name = asString(store.name)

  if (!id || !name) return null

  return {
    id,
    name,
    complexNumber:
      typeof store.complexNumber === 'number' ? store.complexNumber : null,
    ...(asString(store.websiteURL)
      ? { websiteUrl: asString(store.websiteURL) }
      : {}),
    address: parseAddress(store.location),
    coordinates: parseCoordinates(store.location),
    openingHours: parseOpeningHours(store.openingHours),
    facilities: parseFacilities(store.facilities),
    commerce: parseCommerce(store.commerce)
  }
}

// Validates and parses the full store dataset into normalized stores
export function parseStores(raw: unknown): Store[] {
  if (!isObject(raw)) {
    throw new StoreParseError('Expected store data to be an object.')
  }

  const { stores } = raw as { stores?: unknown }

  if (!Array.isArray(stores)) {
    throw new StoreParseError(
      'Expected store data to contain a "stores" array.'
    )
  }

  return stores
    .map(parseStore)
    .filter((store): store is Store => store !== null)
}
