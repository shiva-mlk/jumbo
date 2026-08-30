import { describe, expect, it } from 'vitest'
import { buildSchema, parse, validate } from 'graphql'
import { typeDefs } from '#server/graphql/schema'
import { STORES_QUERY } from '@/composables/useStoresQuery'
import { STORE_QUERY } from '@/composables/useStoreQuery'
import { SUGGESTIONS_QUERY } from '@/composables/useSuggestionsQuery'

// The client types and query documents are written by hand, so we should check that they 
// are still valid against the schema.
const schema = buildSchema(typeDefs)

const documents = {
  stores: STORES_QUERY,
  store: STORE_QUERY,
  suggestions: SUGGESTIONS_QUERY
}

describe('GraphQL documents', () => {
  it.each(Object.entries(documents))(
    'the %s query is valid against the schema',
    (_name, document) => {
      expect(validate(schema, parse(document))).toEqual([])
    }
  )

  it('rejects a document asking for a field the schema does not have', () => {
    const errors = validate(schema, parse('{ stores { items { notAField } } }'))

    expect(errors).not.toEqual([])
    expect(errors[0]?.message).toContain('notAField')
  })
})
