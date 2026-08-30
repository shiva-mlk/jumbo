// Mirrors the parsed Store model. Nullability is intentional where the raw JSON is actually missing data.
export const typeDefs = /* GraphQL */ `
  type Address {
    street: String!
    houseNumber: String
    postalCode: String!
    city: String!
    state: String!
    countryCode: String!
    "Street and house number joined for display."
    formatted: String!
  }

  type Coordinates {
    lat: Float!
    lng: Float!
  }

  "A day with no times is a day the store is closed."
  type OpeningHoursDay {
    opensAt: String
    closesAt: String
  }

  type OpeningHours {
    monday: OpeningHoursDay!
    tuesday: OpeningHoursDay!
    wednesday: OpeningHoursDay!
    thursday: OpeningHoursDay!
    friday: OpeningHoursDay!
    saturday: OpeningHoursDay!
    sunday: OpeningHoursDay!
  }

  type Facilities {
    cookingStudio: Boolean!
    dryCleaning: Boolean!
    flowers: Boolean!
    kitchen: Boolean!
    liquorService: Boolean!
    locationType: String
    parking: String
    pharmacy: Boolean!
    photoService: Boolean!
    pickUpType: String
    postOffice: Boolean!
    selfCheckout: Boolean!
    selfScan: Boolean!
    wifi: Boolean!
  }

  type CommerceChannel {
    available: Boolean!
    startsOn: String
    endsOn: String
  }

  type Commerce {
    inStore: CommerceChannel!
    homeDelivery: CommerceChannel!
    collection: CommerceChannel!
  }

  type Store {
    id: ID!
    name: String!
    complexNumber: Int
    "Missing on a few records, so clients must render the link conditionally."
    websiteUrl: String
    address: Address!
    "Null for records that carry placeholder 0,0 coordinates."
    coordinates: Coordinates
    openingHours: OpeningHours!
    facilities: Facilities!
    commerce: Commerce!
  }

  type StorePage {
    items: [Store!]!
    total: Int!
    page: Int!
    perPage: Int!
    totalPages: Int!
  }

  enum SuggestionType {
    CITY
    STORE
  }

  type Suggestion {
    value: String!
    type: SuggestionType!
  }

  type Query {
    "A page of stores, optionally narrowed by a search query."
    stores(query: String, page: Int, perPage: Int): StorePage!
    "A single store by id, or null when it does not exist."
    store(id: ID!): Store
    "Autocomplete entries: matching cities first, then store names."
    suggestions(query: String!, limit: Int): [Suggestion!]!
  }
`
