<script setup lang="ts">
// Implements the WAI-ARIA combobox pattern (listbox popup). The important
// pieces are: role="combobox" on the input, aria-expanded reflecting the popup,
// aria-controls pointing at the listbox, and aria-activedescendant naming the
// visually highlighted option while DOM focus stays in the input.
//
// Vue APIs are imported explicitly so the component can be mounted under plain
// Vitest, which has no Nuxt auto-import layer. useI18n and useId stay as
// auto-imports and are stubbed in the test.
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Suggestion } from '~/composables/useSuggestionsQuery'

const props = withDefaults(
  defineProps<{
    modelValue: string
    suggestions: Suggestion[]
    loading?: boolean
  }>(),
  { loading: false }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [value: string]
}>()

const { t } = useI18n()

const inputId = useId()
const listboxId = useId()

const isOpen = ref(false)
/** -1 means "nothing highlighted", i.e. focus is conceptually on the input. */
const activeIndex = ref(-1)
const containerRef = ref<HTMLElement | null>(null)

const hasItems = computed(() => props.suggestions.length > 0)
const isExpanded = computed(() => isOpen.value && hasItems.value)
const activeId = computed(() =>
  activeIndex.value >= 0 ? `${listboxId}-option-${activeIndex.value}` : undefined
)

function open() {
  if (hasItems.value) isOpen.value = true
}

function close() {
  isOpen.value = false
  activeIndex.value = -1
}

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
  activeIndex.value = -1
  isOpen.value = true
}

function select(suggestion: Suggestion) {
  emit('update:modelValue', suggestion.value)
  emit('submit', suggestion.value)
  close()
}

function move(delta: number) {
  if (!hasItems.value) return

  isOpen.value = true

  // There are suggestions.length + 1 states: one per option plus "nothing
  // highlighted" (-1). Shifting by one maps them onto 0..length so the modulo
  // wraps cleanly, which is what lets ArrowUp from the input reach the last
  // option and ArrowDown off the end return to the input.
  const count = props.suggestions.length
  activeIndex.value = (activeIndex.value + 1 + delta + count + 1) % (count + 1) - 1
}

function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      move(-1)
      break
    case 'Enter': {
      const active = props.suggestions[activeIndex.value]
      if (isOpen.value && active) {
        event.preventDefault()
        select(active)
      } else {
        emit('submit', props.modelValue)
        close()
      }
      break
    }
    case 'Escape':
      event.preventDefault()
      close()
      break
    case 'Tab':
      // Not prevented: focus should still move on.
      close()
      break
  }
}

function clear() {
  emit('update:modelValue', '')
  emit('submit', '')
  close()
}

// Clicking anywhere outside dismisses the popup, as the pattern requires.
onMounted(() => {
  const handler = (event: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) close()
  }

  document.addEventListener('click', handler)
  onUnmounted(() => document.removeEventListener('click', handler))
})

// A highlight into a list that just emptied would point at nothing.
watch(
  () => props.suggestions,
  (list) => {
    if (list.length === 0) activeIndex.value = -1
  }
)
</script>

<template>
  <div
    ref="containerRef"
    class="relative"
  >
    <label
      :for="inputId"
      class="block text-sm font-semibold text-jumbo-black"
    >
      {{ t('search.label') }}
    </label>

    <div class="relative mt-1">
      <Icon
        name="lucide:search"
        class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-jumbo-grey"
        aria-hidden="true"
      />

      <input
        :id="inputId"
        :value="modelValue"
        type="text"
        role="combobox"
        autocomplete="off"
        :aria-expanded="isExpanded"
        :aria-controls="listboxId"
        :aria-activedescendant="activeId"
        aria-autocomplete="list"
        :placeholder="t('search.placeholder')"
        class="w-full rounded-card border border-jumbo-grey py-2 pr-10 pl-10 text-jumbo-black placeholder:text-jumbo-grey"
        @input="onInput"
        @keydown="onKeydown"
        @focus="open"
      >

      <button
        v-if="modelValue"
        type="button"
        class="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-jumbo-grey hover:bg-jumbo-grey-light"
        :aria-label="t('search.clear')"
        @click="clear"
      >
        <Icon
          name="lucide:x"
          class="size-4"
          aria-hidden="true"
        />
      </button>
    </div>

    <ul
      v-show="isExpanded"
      :id="listboxId"
      role="listbox"
      :aria-label="t('search.suggestions')"
      class="absolute z-20 mt-1 max-h-72 w-full list-none overflow-auto rounded-card border border-jumbo-grey bg-white p-0 shadow-lg"
    >
      <li
        v-for="(suggestion, index) in suggestions"
        :id="`${listboxId}-option-${index}`"
        :key="`${suggestion.type}-${suggestion.value}`"
        role="option"
        :aria-selected="index === activeIndex"
        class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm"
        :class="index === activeIndex ? 'bg-jumbo-yellow text-jumbo-black' : 'text-jumbo-black'"
        @click="select(suggestion)"
        @mousemove="activeIndex = index"
      >
        <Icon
          :name="suggestion.type === 'CITY' ? 'lucide:map-pin' : 'lucide:store'"
          class="size-4 shrink-0 text-jumbo-grey"
          aria-hidden="true"
        />
        <span>{{ suggestion.value }}</span>
        <span class="sr-only">
          {{ suggestion.type === 'CITY' ? t('search.typeCity') : t('search.typeStore') }}
        </span>
      </li>
    </ul>

    <p
      class="sr-only"
      role="status"
    >
      <template v-if="loading">{{ t('search.loading') }}</template>
      <template v-else-if="isExpanded">
        {{ t('search.resultsAvailable', suggestions.length) }}
      </template>
    </p>
  </div>
</template>
