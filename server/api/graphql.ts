import { createSchema, createYoga } from 'graphql-yoga'
import { typeDefs } from '#server/graphql/schema'
import { resolvers } from '#server/graphql/resolvers'

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response }
})

export default defineEventHandler(async (event) => {
  return yoga.handleNodeRequestAndResponse(event.node.req, event.node.res)
})
