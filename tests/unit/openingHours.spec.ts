import { describe, expect, it } from 'vitest'
import {
  formatMinutes,
  getTodaysClosingTime,
  getNextOpening,
  isStoreOpen,
  parseTime
} from '#shared/utils/openingHours'
import { WEEKDAYS, type OpeningHours } from '#shared/types/store'

function makeHours(overrides: Partial<OpeningHours> = {}): OpeningHours {
  const hours = {} as OpeningHours
  for (const day of WEEKDAYS) hours[day] = {}
  return { ...hours, ...overrides }
}

const WEEKDAY_HOURS = makeHours({
  monday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' },
  tuesday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' },
  wednesday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' },
  thursday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' },
  friday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' },
  saturday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' },
  sunday: { opensAt: '10:00+01:00', closesAt: '20:00+01:00' }
})

const mondayAt = (time: string) => new Date(`2026-08-31T${time}:00+02:00`)
const sundayAt = (time: string) => new Date(`2026-08-30T${time}:00+02:00`)

describe('parseTime', () => {
  it('parses the offset format used by most of the dataset', () => {
    expect(parseTime('08:00+01:00')).toEqual({ minutes: 480, offsetMinutes: 60 })
    expect(parseTime('21:30+01:00')).toEqual({ minutes: 1290, offsetMinutes: 60 })
  })

  it('parses the Z format used by three records', () => {
    expect(parseTime('21:00Z')).toEqual({ minutes: 1260, offsetMinutes: 0 })
  })

  it('parses a negative offset', () => {
    expect(parseTime('08:00-05:30')).toEqual({ minutes: 480, offsetMinutes: -330 })
  })

  it('handles midnight and one minute past it', () => {
    expect(parseTime('00:00+01:00')?.minutes).toBe(0)
    expect(parseTime('00:01+01:00')?.minutes).toBe(1)
  })

  it('returns null for missing or malformed values', () => {
    expect(parseTime(undefined)).toBeNull()
    expect(parseTime('')).toBeNull()
    expect(parseTime('8:00+01:00')).toBeNull()
    expect(parseTime('08:00')).toBeNull()
    expect(parseTime('25:00+01:00')).toBeNull()
    expect(parseTime('08:75+01:00')).toBeNull()
    expect(parseTime('nonsense')).toBeNull()
  })
})

describe('isStoreOpen', () => {
  it('is open in the middle of the day', () => {
    expect(isStoreOpen(WEEKDAY_HOURS, mondayAt('12:00'))).toBe(true)
  })

  it('is closed before opening', () => {
    expect(isStoreOpen(WEEKDAY_HOURS, mondayAt('07:59'))).toBe(false)
  })

  it('is open exactly at the opening minute', () => {
    expect(isStoreOpen(WEEKDAY_HOURS, mondayAt('08:00'))).toBe(true)
  })

  it('is closed exactly at the closing minute', () => {
    expect(isStoreOpen(WEEKDAY_HOURS, mondayAt('21:00'))).toBe(false)
  })

  it('is open one minute before closing', () => {
    expect(isStoreOpen(WEEKDAY_HOURS, mondayAt('20:59'))).toBe(true)
  })

  it('is closed after closing time', () => {
    expect(isStoreOpen(WEEKDAY_HOURS, mondayAt('22:00'))).toBe(false)
  })

  it('uses the correct day of the week', () => {
    expect(isStoreOpen(WEEKDAY_HOURS, sundayAt('09:00'))).toBe(false)
    expect(isStoreOpen(WEEKDAY_HOURS, sundayAt('11:00'))).toBe(true)
  })

  it('reads times as local wall clock, so summer time is handled', () => {
    expect(isStoreOpen(WEEKDAY_HOURS, mondayAt('08:30'))).toBe(true)
  })

  it('is closed on a day with no hours', () => {
    const hours = makeHours({ monday: {} })
    expect(isStoreOpen(hours, mondayAt('12:00'))).toBe(false)
  })

  it('is closed on a day that only has a closing time', () => {
    const hours = makeHours({ monday: { closesAt: '00:01+01:00' } })
    expect(isStoreOpen(hours, mondayAt('12:00'))).toBe(false)
  })

  it('is closed when the window is inverted or empty', () => {
    const inverted = makeHours({ monday: { opensAt: '21:00+01:00', closesAt: '08:00+01:00' } })
    const empty = makeHours({ monday: { opensAt: '08:00+01:00', closesAt: '08:00+01:00' } })
    expect(isStoreOpen(inverted, mondayAt('23:00'))).toBe(false)
    expect(isStoreOpen(empty, mondayAt('08:00'))).toBe(false)
  })

  it('is closed for undefined hours or an invalid date', () => {
    expect(isStoreOpen(undefined, mondayAt('12:00'))).toBe(false)
    expect(isStoreOpen(WEEKDAY_HOURS, new Date('nope'))).toBe(false)
  })
})

describe('getNextOpening', () => {
  it('returns today when the store has not opened yet', () => {
    expect(getNextOpening(WEEKDAY_HOURS, mondayAt('06:00'))).toEqual({
      weekday: 'monday',
      time: '08:00',
      dayOffset: 0
    })
  })

  it('returns tomorrow once today opening time has passed', () => {
    expect(getNextOpening(WEEKDAY_HOURS, mondayAt('22:00'))).toEqual({
      weekday: 'tuesday',
      time: '08:00',
      dayOffset: 1
    })
  })

  it('skips closed days to find the next open one', () => {
    const hours = makeHours({
      monday: {},
      tuesday: {},
      wednesday: { opensAt: '09:00+01:00', closesAt: '18:00+01:00' }
    })

    expect(getNextOpening(hours, mondayAt('10:00'))).toEqual({
      weekday: 'wednesday',
      time: '09:00',
      dayOffset: 2
    })
  })

  it('wraps around the end of the week', () => {
    const hours = makeHours({ monday: { opensAt: '08:00+01:00', closesAt: '21:00+01:00' } })

    expect(getNextOpening(hours, sundayAt('12:00'))).toEqual({
      weekday: 'monday',
      time: '08:00',
      dayOffset: 1
    })
  })

  it('does not return today when the store is already open', () => {
    expect(getNextOpening(WEEKDAY_HOURS, mondayAt('12:00'))?.dayOffset).toBe(1)
  })

  it('returns null when the store lists no opening times at all', () => {
    expect(getNextOpening(makeHours(), mondayAt('12:00'))).toBeNull()
  })

  it('ignores days that only have a closing time', () => {
    const hours = makeHours({
      monday: { closesAt: '00:01+01:00' },
      tuesday: { closesAt: '00:01+01:00' }
    })

    expect(getNextOpening(hours, mondayAt('12:00'))).toBeNull()
  })

  it('returns null for undefined hours', () => {
    expect(getNextOpening(undefined, mondayAt('12:00'))).toBeNull()
  })
})

describe('getTodaysClosingTime', () => {
  it('returns today closing time', () => {
    expect(getTodaysClosingTime(WEEKDAY_HOURS, mondayAt('12:00'))).toBe('21:00')
    expect(getTodaysClosingTime(WEEKDAY_HOURS, sundayAt('12:00'))).toBe('20:00')
  })

  it('returns null on a day without hours', () => {
    expect(getTodaysClosingTime(makeHours(), mondayAt('12:00'))).toBeNull()
  })
})

describe('formatMinutes', () => {
  it('pads hours and minutes', () => {
    expect(formatMinutes(0)).toBe('00:00')
    expect(formatMinutes(480)).toBe('08:00')
    expect(formatMinutes(1290)).toBe('21:30')
    expect(formatMinutes(1439)).toBe('23:59')
  })
})
