<script setup lang="ts">
import { DEFAULT_PAGE_SIZE } from '#shared/utils/filterStores'

const props = withDefaults(defineProps<{ count?: number }>(), {
  count: DEFAULT_PAGE_SIZE
})

const { t } = useI18n()

const placeholders = computed(() =>
  Array.from({ length: props.count }, (_, index) => index)
)
</script>

<template>
  <div>
    <p class="sr-only" role="status">
      {{ t('stores.loading') }}
    </p>

    <StoreGrid :items="placeholders">
      <StoreCardSkeleton />
    </StoreGrid>
  </div>
</template>
