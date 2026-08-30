<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 12 })

const { t } = useI18n()
</script>

<template>
  <div>
    <p
      class="sr-only"
      role="status"
    >
      {{ t('stores.loading') }}
    </p>

    <StoreGrid>
      <li
        v-for="index in count"
        :key="index"
      >
        <StoreCardSkeleton />
      </li>
    </StoreGrid>
  </div>
</template>
