import { WEEKDAYS, type Weekday } from '#shared/types/store'

export function useWeekdayNames() {
  const { locale } = useI18n()

  const names = computed(() => {
    const formatter = new Intl.DateTimeFormat(locale.value, {
      weekday: 'long',
      timeZone: 'UTC'
    })

    return Object.fromEntries(
      WEEKDAYS.map((day, index) => [
        day,
        formatter.format(new Date(Date.UTC(2024, 0, 1 + index)))
      ])
    ) as Record<Weekday, string>
  })

  return {
    names,
    nameOf: (weekday: Weekday) => names.value[weekday]
  }
}
