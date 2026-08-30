import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchCombobox from '@/components/ui/SearchCombobox.vue'
import BaseList from '@/components/ui/BaseList.vue'
import type { Suggestion } from '@/composables/useSuggestionsQuery'

vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
vi.stubGlobal('useId', () => 'test-id')

const SUGGESTIONS: Suggestion[] = [
  { value: 'EINDHOVEN', type: 'CITY' },
  { value: 'Jumbo Eindhoven Nederlandplein', type: 'STORE' },
  { value: 'Jumbo Eindhoven Woensel', type: 'STORE' }
]

function mountCombobox(suggestions: Suggestion[] = SUGGESTIONS) {
  return mount(SearchCombobox, {
    props: { modelValue: 'eind', suggestions },
    global: {
      components: { BaseList },
      stubs: { Icon: true },
      mocks: { $t: (key: string) => key }
    }
  })
}

describe('SearchCombobox', () => {
  it('marks the input as a combobox with a listbox popup', () => {
    const input = mountCombobox().get('input')

    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-autocomplete')).toBe('list')
    expect(input.attributes('aria-controls')).toBeDefined()
  })

  it('is collapsed until the popup opens', async () => {
    const wrapper = mountCombobox()
    const input = wrapper.get('input')

    expect(input.attributes('aria-expanded')).toBe('false')

    await input.trigger('focus')

    expect(wrapper.get('input').attributes('aria-expanded')).toBe('true')
  })

  it('reports no popup when there is nothing to suggest', async () => {
    const wrapper = mountCombobox([])
    await wrapper.get('input').trigger('focus')

    expect(wrapper.get('input').attributes('aria-expanded')).toBe('false')
  })

  it('moves through the options with ArrowDown', async () => {
    const wrapper = mountCombobox()
    const input = wrapper.get('input')

    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowDown' })

    // The regression this guards: the first ArrowDown must land on option 0,
    // not back on "nothing highlighted".
    expect(input.attributes('aria-activedescendant')).toBe('test-id-option-0')

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant')).toBe('test-id-option-1')
  })

  it('wraps from the last option back to the input', async () => {
    const wrapper = mountCombobox()
    const input = wrapper.get('input')

    await input.trigger('focus')
    for (let i = 0; i < SUGGESTIONS.length; i++) {
      await input.trigger('keydown', { key: 'ArrowDown' })
    }

    expect(input.attributes('aria-activedescendant')).toBe('test-id-option-2')

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant')).toBeUndefined()
  })

  it('jumps to the last option with ArrowUp from the input', async () => {
    const wrapper = mountCombobox()
    const input = wrapper.get('input')

    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowUp' })

    expect(input.attributes('aria-activedescendant')).toBe('test-id-option-2')
  })

  it('marks only the active option as selected', async () => {
    const wrapper = mountCombobox()
    const input = wrapper.get('input')

    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowDown' })

    const selected = wrapper.findAll('[role="option"]').map((o) => o.attributes('aria-selected'))
    expect(selected).toEqual(['true', 'false', 'false'])
  })

  it('selects the highlighted option with Enter', async () => {
    const wrapper = mountCombobox()
    const input = wrapper.get('input')

    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['EINDHOVEN'])
    expect(wrapper.emitted('submit')?.at(-1)).toEqual(['EINDHOVEN'])
  })

  it('submits the typed text when no option is highlighted', async () => {
    const wrapper = mountCombobox()
    const input = wrapper.get('input')

    await input.trigger('focus')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('submit')?.at(-1)).toEqual(['eind'])
  })

  it('selects an option on click', async () => {
    const wrapper = mountCombobox()
    await wrapper.get('input').trigger('focus')

    await wrapper.findAll('[role="option"]')[1]!.trigger('click')

    expect(wrapper.emitted('submit')?.at(-1)).toEqual(['Jumbo Eindhoven Nederlandplein'])
  })

  it('closes on Escape without changing the value', async () => {
    const wrapper = mountCombobox()
    const input = wrapper.get('input')

    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Escape' })

    expect(input.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('clears the value with the clear button', async () => {
    const wrapper = mountCombobox()

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
    expect(wrapper.emitted('submit')?.at(-1)).toEqual([''])
  })
})
