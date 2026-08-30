<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const page = computed({
  get: () => {
    const value = Number(route.query.page)
    return Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1
  },
  set: (value: number) => {
    router.replace({ query: { ...route.query, page: value > 1 ? String(value) : undefined } })
  }
})

const query = ref('')
const now = useNow()

const { data, isPending, isError, error, refetch, isPlaceholderData, suspense } =
  useStoresQuery(query, page)

onServerPrefetch(() => suspense())

useHead({ title: () => `${t('app.name')} ${t('stores.title')}` })

function onPageChange(next: number) {
  page.value = next
  if (import.meta.client) window.scrollTo({ top: 0 })
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-jumbo-black">{{ t('stores.title') }}</h1>

    <!-- Loading -->
    <StoreGridSkeleton
      v-if="isPending"
      class="mt-6"
    />

    <!-- Error -->
    <ErrorState
      v-else-if="isError"
      class="mt-6"
      :message="error?.message"
      @retry="refetch()"
    />

    <!-- Empty -->
    <EmptyState
      v-else-if="data && data.total == 0"
      class="mt-6"
      :message="t('stores.empty')"
    />

    <!-- Results -->
    <div
      v-else-if="data"
      class="mt-6"
    >
      <p
        class="text-sm text-jumbo-grey"
        role="status"
      >
        {{ t('stores.count', data.total) }}
      </p>

      <StoreGrid
        class="mt-4"
        :class="{ 'opacity-60': isPlaceholderData }"
      >
        <li
          v-for="store in data.items"
          :key="store.id"
        >
          <StoreCard
            :store="store"
            :now="now"
          />
        </li>
      </StoreGrid>

      <PaginationControls
        class="mt-8"
        :page="data.page"
        :total-pages="data.totalPages"
        @change="onPageChange"
      />
    </div>
  </div>
</template>
