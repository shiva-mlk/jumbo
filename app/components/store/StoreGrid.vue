<script setup lang="ts" generic="T">
withDefaults(
  defineProps<{
    items: T[]
    itemKey?: (item: T, index: number) => string | number
  }>(),
  { itemKey: undefined }
)

defineSlots<{
  default: (props: { item: T; index: number }) => unknown
}>()
</script>

<template>
  <BaseList
    :items="items"
    :item-key="itemKey"
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
  >
    <template #default="{ item, index }">
      <slot :item="item" :index="index" />
    </template>
  </BaseList>
</template>
