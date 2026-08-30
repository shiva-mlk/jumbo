<script setup lang="ts">
import { WEEKDAYS, type OpeningHours } from '#shared/types/store'
import { parseTime, formatMinutes, getZonedNow } from '#shared/utils/openingHours'

const props = defineProps<{
  openingHours: OpeningHours
  now: Date
}>()

const { t } = useI18n()
const { nameOf } = useWeekdayNames()

const today = computed(() => getZonedNow(props.now)?.weekday ?? null)

const rows = computed(() =>
  WEEKDAYS.map((weekday) => {
    const day = props.openingHours[weekday]
    const opensAt = parseTime(day?.opensAt)
    const closesAt = parseTime(day?.closesAt)

    return {
      weekday,
      label: nameOf(weekday),
      hours:
        opensAt && closesAt
          ? `${formatMinutes(opensAt.minutes)} – ${formatMinutes(closesAt.minutes)}`
          : null,
      isToday: weekday === today.value
    }
  })
)
</script>

<template>
  <table class="w-full text-sm">
    <caption class="sr-only">
      {{ t('store.openingHours') }}
    </caption>
    <tbody>
      <tr
        v-for="row in rows"
        :key="row.weekday"
        class="border-b border-jumbo-grey-light last:border-0"
        :class="row.isToday ? 'font-bold text-jumbo-black' : 'text-jumbo-grey'"
      >
        <th
          scope="row"
          class="py-2 text-left"
          :class="row.isToday ? 'font-bold' : 'font-normal'"
        >
          {{ row.label }}
          <span
            v-if="row.isToday"
            class="sr-only"
          >({{ t('store.today') }})</span>
        </th>
        <td class="py-2 text-right tabular-nums">
          {{ row.hours ?? t('store.closed') }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
