import { WEEKDAYS, type OpeningHours, type Weekday } from '#shared/types/store'

// Official Dutch time zone used for all store time comparisons
export const STORE_TIME_ZONE = 'Europe/Amsterdam'

const MINUTES_PER_DAY = 24 * 60

export interface ParsedTime {
  minutes: number
  offsetMinutes: number
}

const TIME_PATTERN = /^(\d{2}):(\d{2})(Z|[+-]\d{2}:\d{2})$/

// Parses time strings like "08:00+01:00" into minutes-since-midnight and timezone offset
export function parseTime(value: string | undefined): ParsedTime | null {
  if (!value) return null

  const match = value.match(TIME_PATTERN)
  if (!match) return null

  const hours = Number(match[1])
  const mins = Number(match[2])
  if (hours > 23 || mins > 59) return null

  const zone = match[3]!
  let offsetMinutes = 0

  if (zone !== 'Z') {
    const sign = zone.startsWith('-') ? -1 : 1
    offsetMinutes =
      sign * (Number(zone.slice(1, 3)) * 60 + Number(zone.slice(4, 6)))
  }

  return { minutes: hours * 60 + mins, offsetMinutes }
}

export interface ZonedNow {
  weekday: Weekday
  minutes: number
}
// Converts a Date to the store's local weekday

export function getZonedNow(
  now: Date,
  timeZone: string = STORE_TIME_ZONE
): ZonedNow | null {
  if (Number.isNaN(now.getTime())) return null

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(now)

  const lookup = (type: string) =>
    parts.find((part) => part.type === type)?.value

  const weekday = lookup('weekday')?.toLowerCase() as Weekday | undefined
  const hour = Number(lookup('hour'))
  const minute = Number(lookup('minute'))

  if (!weekday || !WEEKDAYS.includes(weekday)) return null
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null

  return { weekday, minutes: hour * 60 + minute }
}

// Calculates a future weekday
function weekdayAt(from: Weekday, offset: number): Weekday {
  const index = WEEKDAYS.indexOf(from)
  return WEEKDAYS[(index + offset) % WEEKDAYS.length]!
}

// Returns true if the store is currently within today's opening window
export function isStoreOpen(
  hours: OpeningHours | undefined,
  now: Date,
  timeZone: string = STORE_TIME_ZONE
): boolean {
  const zoned = getZonedNow(now, timeZone)
  if (!hours || !zoned) return false

  const today = hours[zoned.weekday]
  const opensAt = parseTime(today?.opensAt)
  const closesAt = parseTime(today?.closesAt)

  if (!opensAt || !closesAt) return false
  if (closesAt.minutes <= opensAt.minutes) return false

  return zoned.minutes >= opensAt.minutes && zoned.minutes < closesAt.minutes
}

export interface NextOpening {
  weekday: Weekday
  time: string
  dayOffset: number
}

// Finds the next opening time for today and next 6 days
export function getNextOpening(
  hours: OpeningHours | undefined,
  now: Date,
  timeZone: string = STORE_TIME_ZONE
): NextOpening | null {
  const zoned = getZonedNow(now, timeZone)
  if (!hours || !zoned) return null

  for (let dayOffset = 0; dayOffset < WEEKDAYS.length; dayOffset++) {
    const weekday = weekdayAt(zoned.weekday, dayOffset)
    const opensAt = parseTime(hours[weekday]?.opensAt)
    if (!opensAt) continue

    if (dayOffset === 0 && opensAt.minutes <= zoned.minutes) continue

    return {
      weekday,
      time: formatMinutes(opensAt.minutes),
      dayOffset
    }
  }

  return null
}

// Formats minutes into an "HH:MM" string
export function formatMinutes(minutes: number): string {
  const normalized =
    ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  const hours = Math.floor(normalized / 60)
  const mins = normalized % 60

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

// Today's closing time as "HH:MM", whether or not the store is open right now
export function getTodaysClosingTime(
  hours: OpeningHours | undefined,
  now: Date,
  timeZone: string = STORE_TIME_ZONE
): string | null {
  const zoned = getZonedNow(now, timeZone)
  if (!hours || !zoned) return null

  const closesAt = parseTime(hours[zoned.weekday]?.closesAt)
  return closesAt ? formatMinutes(closesAt.minutes) : null
}
