import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, ref } from 'vue'
import { useDebouncedRef } from '@/composables/useDebouncedRef'

describe('useDebouncedRef', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts with the source value', () => {
    expect(useDebouncedRef(ref('jumbo')).value).toBe('jumbo')
  })

  it('does not update before the delay has passed', () => {
    const source = ref('')
    const debounced = useDebouncedRef(source, 300)

    source.value = 'eindhoven'
    vi.advanceTimersByTime(299)

    expect(debounced.value).toBe('')
  })

  it('updates once the delay has passed', () => {
    const source = ref('')
    const debounced = useDebouncedRef(source, 300)

    source.value = 'eindhoven'
    vi.advanceTimersByTime(300)

    expect(debounced.value).toBe('eindhoven')
  })

  it('only emits the last value of a burst of keystrokes', () => {
    const source = ref('')
    const debounced = useDebouncedRef(source, 300)

    for (const value of ['e', 'ei', 'ein', 'eind']) {
      source.value = value
      vi.advanceTimersByTime(100)
    }

    // 400ms have passed, but never 300ms without a change.
    expect(debounced.value).toBe('')

    vi.advanceTimersByTime(300)
    expect(debounced.value).toBe('eind')
  })

  it('emits again for a change after the first settled', () => {
    const source = ref('')
    const debounced = useDebouncedRef(source, 300)

    source.value = 'eindhoven'
    vi.advanceTimersByTime(300)
    expect(debounced.value).toBe('eindhoven')

    source.value = 'kollum'
    vi.advanceTimersByTime(300)
    expect(debounced.value).toBe('kollum')
  })

  it('updates immediately when the delay is zero', () => {
    const source = ref('')
    const debounced = useDebouncedRef(source, 0)

    source.value = 'eindhoven'

    expect(debounced.value).toBe('eindhoven')
  })

  it('works with non-string values', () => {
    const source = ref(1)
    const debounced = useDebouncedRef(source, 300)

    source.value = 2
    vi.advanceTimersByTime(300)

    expect(debounced.value).toBe(2)
  })

  it('cancels a pending update when the scope is disposed', () => {
    const source = ref('')
    const scope = effectScope()
    const debounced = scope.run(() => useDebouncedRef(source, 300))!

    source.value = 'eindhoven'
    scope.stop()
    vi.advanceTimersByTime(1000)

    expect(debounced.value).toBe('')
  })
})
