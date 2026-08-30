<script setup lang="ts" generic="T">
import type { LiHTMLAttributes } from 'vue'

withDefaults(
  defineProps<{
    items: T[]
    itemKey?: (item: T, index: number) => string | number
    itemClass?: (item: T, index: number) => string | undefined
    itemAttrs?: (item: T, index: number) => LiHTMLAttributes
  }>(),
  { itemKey: undefined, itemClass: undefined, itemAttrs: undefined }
)

defineSlots<{
  default: (props: { item: T; index: number }) => unknown
}>()
</script>

<template>
  <ul class="list-none p-0">
    <li
      v-for="(item, index) in items"
      :key="itemKey ? itemKey(item, index) : index"
      :class="itemClass?.(item, index)"
      v-bind="itemAttrs?.(item, index)"
    >
      <slot :item="item" :index="index" />
    </li>
  </ul>
</template>
