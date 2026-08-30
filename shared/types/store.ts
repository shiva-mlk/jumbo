export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const

export type Weekday = (typeof WEEKDAYS)[number]

// Raw JSON shapes                                                            

export interface RawAddress {
  street?: string
  houseNumber?: string
  postalCode?: string
  city?: string
  state?: string
  countryCode?: string
}

export interface RawLocation {
  latitude?: number
  longitude?: number
  address?: RawAddress
}

export interface RawOpeningHoursDay {
  opensAt?: string
  closesAt?: string
}

export type RawOpeningHours = Partial<Record<Weekday, RawOpeningHoursDay>>

export interface RawFacilities {
  cookingStudio?: boolean
  dryCleaning?: boolean
  flowers?: boolean
  kitchen?: boolean
  liquorService?: boolean
  locationType?: string
  parking?: string
  pharmacy?: boolean
  photoService?: boolean
  pickUpType?: string
  postOffice?: boolean
  selfCheckout?: boolean
  selfScan?: boolean
  wifi?: boolean
}

export interface RawCommerceAvailability {
  startsOn?: string
  endsOn?: string
}

export interface RawCommerceChannel {
  available?: boolean
  availability?: RawCommerceAvailability
}

export interface RawCommerce {
  inStore?: RawCommerceChannel
  homeDelivery?: RawCommerceChannel
  collection?: RawCommerceChannel
}

export interface RawStore {
  storeId?: string
  name?: string
  complexNumber?: number
  websiteURL?: string
  facilities?: RawFacilities
  commerce?: RawCommerce
  location?: RawLocation
  openingHours?: RawOpeningHours
}

export interface RawStoreData {
  stores?: RawStore[]
}

// Normalized application model 

export interface Address {
  street: string
  houseNumber?: string
  postalCode: string
  city: string
  state: string
  countryCode: string
  formatted: string
}

export interface Coordinates {
  lat: number
  lng: number
}

export interface OpeningHoursDay {
  opensAt?: string
  closesAt?: string
}

export type OpeningHours = Record<Weekday, OpeningHoursDay>

export interface Facilities {
  cookingStudio: boolean
  dryCleaning: boolean
  flowers: boolean
  kitchen: boolean
  liquorService: boolean
  locationType: string | null
  parking: string | null
  pharmacy: boolean
  photoService: boolean
  pickUpType: string | null
  postOffice: boolean
  selfCheckout: boolean
  selfScan: boolean
  wifi: boolean
}

export interface CommerceChannel {
  available: boolean
  startsOn: string | null
  endsOn: string | null
}

export interface Commerce {
  inStore: CommerceChannel
  homeDelivery: CommerceChannel
  collection: CommerceChannel
}

export interface Store {
  id: string
  name: string
  complexNumber: number | null
  websiteUrl?: string
  address: Address
  coordinates: Coordinates | null
  openingHours: OpeningHours
  facilities: Facilities
  commerce: Commerce
}
