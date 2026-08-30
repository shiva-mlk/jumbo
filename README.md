# Jumbo Store Locator

A store locator for the Jumbo Tech Campus front-end assignment. It renders the
806 stores from the provided dataset as a searchable, paginated overview with a
detail page per store, in English and Dutch.

Built with **Nuxt 4**, **TypeScript** in strict mode, **Tailwind CSS v4**, and a
**GraphQL** server that exposes the dataset to the front-end.

## Quick start

```bash
npm install
npm run dev
```

The app runs on <http://localhost:3000>. If that port is taken Nuxt picks the
next free one and prints the URL.

GraphiQL is available at <http://localhost:3000/api/graphql> if you want to
explore the schema.

Requires Node 22.19+, 24.11+, or 26+ — the range Nuxt 4 itself declares. CI runs
on Node 22.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint over the whole project |
| `npm run typecheck` | `vue-tsc` against the strict TypeScript config |
| `npm run test` | 93 unit tests (Vitest) |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:e2e` | 28 end-to-end tests (Playwright) |

`npm run test:e2e` builds the app and starts a preview server itself, so the
end-to-end suite runs against a production build rather than the dev server.

## How it is put together

```
shared/          Pure logic, no framework: parsing, opening hours, filtering
server/graphql/  Schema and resolvers over that logic
app/composables/ vue-query bindings, one per query
app/components/  ui/ is store-agnostic, store/ knows the domain
```

**The interesting logic lives in `shared/` as pure functions.** Parsing the
dataset, deciding whether a store is open, and filtering are plain functions
that take their inputs as arguments — including `now: Date`, which is what makes
the opening-hours rules testable at a fixed moment. The GraphQL resolvers and
the UI are thin layers over them. That is also why 81 of the 93 unit tests need
no DOM at all.

**GraphQL sits between the data and the UI** because that is how Jumbo's
front-ends talk to their back-ends. Filtering and pagination happen server-side,
so the browser only ever receives one page of results rather than all 806
records.

**vue-query** handles caching, loading and error states, and keeps the previous
page visible while the next one loads. Its cache is dehydrated on the server and
hydrated in the browser, so the first response already contains rendered stores
instead of a loading skeleton.

**Every list renders through one `BaseList` component.** A `<ul>` whose children
are not `<li>` is invalid markup and makes screen readers announce the wrong
number of items, so the structure is written once rather than in each component.

## Notable decisions

**Opening hours ignore the offset in the data.** Every record states `+01:00`
year-round, but the Netherlands is on `+02:00` for about seven months. Reading
that offset literally reports a store as closed at 08:30 on a summer morning, so
times are compared as local wall-clock time in `Europe/Amsterdam`.

**The dataset is treated as untrusted.** Verified against all 806 records: 32
merge the house number into the street, 16 carry placeholder `0,0` coordinates,
3 have no website, 12 list no opening hours at all, and one lists only a closing
time. Each of those has a named test.

**Icons are bundled, not fetched.** `@nuxt/icon` is configured with a local
Iconify collection, so the app makes no third-party requests. The one exception
is OpenStreetMap map tiles on the detail page; everything else works offline.

**Browser language detection is off.** With it on, the first visit redirects
based on the visitor's browser settings, so two reviewers would see different
applications. The language switcher is explicit instead.

## Requirements

### Functional

| Requirement | Where |
| --- | --- |
| **Must** — Paginated overview of all stores | `app/pages/index.vue`, `PaginationControls.vue` |
| **Must** — Name, address, website link, open status | `StoreCard.vue`, `OpenStatusBadge.vue` |
| **Must** — When a closed store opens next | `getNextOpening()` in `shared/utils/openingHours.ts` |
| **Should** — Filter through search | `SearchCombobox.vue`, `filterStores()` |
| **Should** — Autocomplete | `SearchCombobox.vue`, `suggestions` query |
| **Should** — Styled like Jumbo.com, intuitive | `app/layouts/default.vue`, brand tokens in `main.css` |
| **Could** — Store location on a map | `StoreMap.vue` (Leaflet + OpenStreetMap) |
| **Could** — Facilities and commerce | `FacilityList.vue` |

### Non-functional

| Requirement | Where |
| --- | --- |
| **Must** — JavaScript or TypeScript | TypeScript throughout |
| **Must** — Easy to run locally | `npm install && npm run dev` |
| **Must** — Accessible through Git | This repository |
| **Should** — Strongly typed | `typescript.strict`, `npm run typecheck` passes |
| **Should** — Performant and scalable | Server-side filtering and pagination, SSR hydration, one shared clock for all cards |
| **Should** — Accessibility standards | See below |
| **Should** — Parsing and filtering unit tested | 73 tests across `parseStores`, `openingHours`, `filterStores` |
| **Could** — Internationalisation | `@nuxtjs/i18n`, English and Dutch |
| **Could** — Error and loading states | `ErrorState.vue`, `EmptyState.vue`, `StoreGridSkeleton.vue`, `app/error.vue` |
| **Could** — End-to-end tests | 28 Playwright tests in `tests/e2e/` |

### Bonus challenges

| Challenge | Status |
| --- | --- |
| Use Nuxt | Nuxt 4 |
| Expose the JSON over GraphQL | GraphQL Yoga at `/api/graphql` |
| Automated pipeline | GitHub Actions: lint, types, unit and end-to-end tests |

## Accessibility

- Skip link as the first tab stop, landmarks for header, main and footer
- The search field follows the WAI-ARIA combobox pattern: `aria-expanded`,
  `aria-controls`, `aria-activedescendant`, and options carrying `aria-selected`
- Keyboard-only operation throughout, including arrow-key navigation that wraps
- Live regions announce result counts and suggestion counts
- `<html lang>` follows the active locale, on error pages too
- Interactive borders meet the 3:1 contrast ratio WCAG 1.4.11 asks for
- `prefers-reduced-motion` is respected

## Tests

| Suite | Count | Covers |
| --- | --- | --- |
| `parseStores.spec.ts` | 15 | Normalising the raw dataset and its edge cases |
| `openingHours.spec.ts` | 28 | Open/closed, next opening, time parsing, summer time |
| `filterStores.spec.ts` | 30 | Search, diacritics, suggestions, pagination |
| `useDebouncedRef.spec.ts` | 8 | Debounce timing and cleanup |
| `SearchCombobox.spec.ts` | 12 | Combobox keyboard behaviour and ARIA |
| `tests/e2e/` | 28 | Overview, search, detail page, errors, accessibility |

## Known limitations

- The dataset contains 20 `VIRTUAL` "Bezorgservice" records, 18 of them sharing
  one address in Veghel. They are shown as ordinary stores because the
  assignment does not say to hide them, but a real locator would filter or
  label them.
- Map tiles come from OpenStreetMap, so the map is blank without a network
  connection. The rest of the page works offline.
- The GraphQL schema is written by hand rather than generated. At around ten
  types that is cheaper than adding codegen.
