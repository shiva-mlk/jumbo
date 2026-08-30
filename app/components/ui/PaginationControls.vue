<script setup lang="ts">
const props = defineProps<{
  page: number
  totalPages: number
}>()

const emit = defineEmits<{ change: [page: number] }>()

const { t } = useI18n()

const pages = computed<(number | 'gap')[]>(() => {
  const { page, totalPages } = props
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const result: (number | 'gap')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  if (start > 2) result.push('gap')
  for (let i = start; i <= end; i++) result.push(i)
  if (end < totalPages - 1) result.push('gap')

  result.push(totalPages)

  return result
})

function go(page: number) {
  if (page < 1 || page > props.totalPages || page === props.page) return
  emit('change', page)
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    :aria-label="t('pagination.label')"
    class="flex items-center justify-center gap-1"
  >
    <BaseButton
      variant="square"
      :disabled="page <= 1"
      :aria-label="t('pagination.previous')"
      @click="go(page - 1)"
    >
      <Icon
        name="lucide:chevron-left"
        class="size-4"
        aria-hidden="true"
      />
    </BaseButton>

    <template
      v-for="(entry, index) in pages"
      :key="`${entry}-${index}`"
    >
      <span
        v-if="entry === 'gap'"
        class="px-1 text-jumbo-grey"
        aria-hidden="true"
      >…</span>

      <BaseButton
        v-else
        variant="square"
        :active="entry === page"
        :aria-label="t('pagination.goToPage', { page: entry })"
        :aria-current="entry === page ? 'page' : undefined"
        @click="go(entry)"
      >
        {{ entry }}
      </BaseButton>
    </template>

    <BaseButton
      variant="square"
      :disabled="page >= totalPages"
      :aria-label="t('pagination.next')"
      @click="go(page + 1)"
    >
      <Icon
        name="lucide:chevron-right"
        class="size-4"
        aria-hidden="true"
      />
    </BaseButton>
  </nav>
</template>
