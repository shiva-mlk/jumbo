<script setup lang="ts">
const props = withDefaults(defineProps<{ count?: number }>(), { count: 12 })

const { t } = useI18n()

const placeholders = computed(() => Array.from({ length: props.count }, (_, index) => index))
</script>

<template>
  <div>
    <p
      class="sr-only"
      role="status"
    >
      {{ t('stores.loading') }}
    </p>

    <StoreGrid :items="placeholders">
      <StoreCardSkeleton />
    </StoreGrid>
  </div>
</template>
