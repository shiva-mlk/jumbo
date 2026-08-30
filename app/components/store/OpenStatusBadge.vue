<script setup lang="ts">
import type { OpeningHours } from '#shared/types/store'
import { getNextOpening, getTodaysClosingTime, isStoreOpen } from '#shared/utils/openingHours'

const props = defineProps<{
  openingHours: OpeningHours
  now: Date
}>()

const { t } = useI18n()

const isOpen = computed(() => isStoreOpen(props.openingHours, props.now))
const closingTime = computed(() => getTodaysClosingTime(props.openingHours, props.now))
const nextOpening = computed(() => getNextOpening(props.openingHours, props.now))

const { nameOf } = useWeekdayNames()

const label = computed(() => {
  if (isOpen.value) {
    return closingTime.value
      ? t('status.openUntil', { time: closingTime.value })
      : t('status.open')
  }

  const next = nextOpening.value
  if (!next) return t('status.closed')

  if (next.dayOffset === 0) return t('status.closedOpensToday', { time: next.time })
  if (next.dayOffset === 1) return t('status.closedOpensTomorrow', { time: next.time })

  return t('status.closedOpensOn', { day: nameOf(next.weekday), time: next.time })
})
</script>

<template>
  <p
    class="inline-flex items-center gap-1.5 text-sm font-medium"
    :class="isOpen ? 'text-jumbo-green' : 'text-jumbo-grey'"
  >
    <span
      class="size-2 shrink-0 rounded-full"
      :class="isOpen ? 'bg-jumbo-green' : 'bg-jumbo-grey'"
      aria-hidden="true"
    />
    {{ label }}
  </p>
</template>
