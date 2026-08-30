<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const id = computed(() => String(route.params.id))
const now = useNow()

const { data: store, isPending, isError, error, refetch, suspense } = useStoreQuery(id)

function notFound() {
  return createError({ statusCode: 404, statusMessage: t('store.notFound'), fatal: true })
}

onServerPrefetch(async () => {
  try {
    await suspense()
  } catch {
    // Rendered by the error state below; letting it escape would abort SSR.
  }

  if (!isError.value && store.value === null) throw notFound()
})

watch(
  [store, isPending, isError],
  ([value, pending, errored]) => {
    if (!pending && !errored && value === null) showError(notFound())
  },
  { immediate: true }
)

useHead({ title: () => (store.value ? `${store.value.name} | ${t('app.name')}` : t('app.name')) })
</script>

<template>
  <div>
    <NuxtLink
      :to="localePath('/')"
      class="inline-flex items-center gap-1 text-sm font-semibold text-jumbo-black hover:underline"
    >
      <Icon
        name="lucide:chevron-left"
        class="size-4"
        aria-hidden="true"
      />
      {{ t('store.backToOverview') }}
    </NuxtLink>

    <div
      v-if="isPending"
      class="mt-6 space-y-4"
    >
      <p
        class="sr-only"
        role="status"
      >
        {{ t('store.loading') }}
      </p>
      <div
        class="h-8 w-2/3 animate-pulse rounded bg-jumbo-grey-light"
        aria-hidden="true"
      />
      <div
        class="h-80 w-full animate-pulse rounded-card bg-jumbo-grey-light"
        aria-hidden="true"
      />
    </div>

    <ErrorState
      v-else-if="isError"
      class="mt-6"
      :message="error?.message"
      @retry="refetch()"
    />

    <article
      v-else-if="store"
      class="mt-6"
    >
      <h1 class="text-2xl font-bold text-jumbo-black">{{ store.name }}</h1>

      <address class="mt-2 text-jumbo-grey not-italic">
        {{ store.address.formatted }}<br >
        {{ store.address.postalCode }} {{ store.address.city }}
      </address>

      <div class="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <OpenStatusBadge
          :opening-hours="store.openingHours"
          :now="now"
        />

        <a
          v-if="store.websiteUrl"
          :href="store.websiteUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex w-fit items-center gap-1 text-sm font-semibold text-jumbo-black underline underline-offset-2"
        >
          {{ t('store.visitWebsite') }}
          <Icon
            name="lucide:external-link"
            class="size-4"
            aria-hidden="true"
          />
          <span class="sr-only">{{ t('common.opensInNewTab') }}</span>
        </a>
      </div>

      <div class="mt-8 grid items-stretch gap-8 lg:grid-cols-2">
        <section class="flex flex-col">
          <h2 class="text-lg font-bold text-jumbo-black">{{ t('store.location') }}</h2>

          <StoreMap
            v-if="store.coordinates"
            class="mt-3 flex-1"
            :coordinates="store.coordinates"
            :name="store.name"
          />
          <p
            v-else
            class="mt-3 flex-1 rounded-card border border-jumbo-border bg-jumbo-grey-light p-6 text-sm text-jumbo-grey"
          >
            {{ t('store.noLocation') }}
          </p>
        </section>

        <section class="flex flex-col">
          <h2 class="text-lg font-bold text-jumbo-black">{{ t('store.openingHours') }}</h2>
          <div class="mt-3 flex-1 rounded-card border border-jumbo-border p-4">
            <OpeningHoursTable
              :opening-hours="store.openingHours"
              :now="now"
            />
          </div>
        </section>
      </div>

      <section class="mt-8">
        <h2 class="text-lg font-bold text-jumbo-black">{{ t('store.aboutThisStore') }}</h2>
        <div class="mt-3 rounded-card border border-jumbo-border p-4">
          <FacilityList
            :facilities="store.facilities"
            :commerce="store.commerce"
          />
        </div>
      </section>
    </article>
  </div>
</template>
