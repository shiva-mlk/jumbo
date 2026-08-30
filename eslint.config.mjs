// @ts-check
import prettier from 'eslint-config-prettier/flat'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['.nuxt', '.output', 'dist', 'node_modules', 'server/data']
  },
  prettier
)
