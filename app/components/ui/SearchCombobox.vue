<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { Suggestion } from '~/composables/useSuggestionsQuery'
import { useCombobox } from '~/composables/useCombobox'

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

const {
  containerRef,
  isExpanded,
  activeIndex,
  open,
  close,
  reset,
  highlight,
  select,
  onKeydown
} = useCombobox<Suggestion>({
  items: toRef(props, 'suggestions'),
  onSelect: (suggestion) => {
    emit('update:modelValue', suggestion.value)
    emit('submit', suggestion.value)
  },
  onSubmit: () => emit('submit', props.modelValue)
})

const activeId = computed(() =>
  activeIndex.value >= 0 ? `${listboxId}-option-${activeIndex.value}` : undefined
)

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
  reset()
}

function clear() {
  emit('update:modelValue', '')
  emit('submit', '')
  close()
}

function optionClass(_suggestion: Suggestion, index: number) {
  return [
    'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm',
    index === activeIndex.value ? 'bg-jumbo-yellow text-jumbo-black' : 'text-jumbo-black'
  ].join(' ')
}

function optionAttrs(suggestion: Suggestion, index: number) {
  return {
    id: `${listboxId}-option-${index}`,
    role: 'option',
    'aria-selected': index === activeIndex.value,
    onClick: () => select(suggestion),
    onMousemove: () => highlight(index)
  }
}
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

    <BaseList
      v-show="isExpanded"
      :id="listboxId"
      role="listbox"
      :aria-label="t('search.suggestions')"
      class="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-card border border-jumbo-grey bg-white shadow-lg"
      :items="suggestions"
      :item-key="(suggestion) => `${suggestion.type}-${suggestion.value}`"
      :item-class="optionClass"
      :item-attrs="optionAttrs"
    >
      <template #default="{ item }">
        <Icon
          :name="item.type === 'CITY' ? 'lucide:map-pin' : 'lucide:store'"
          class="size-4 shrink-0 text-jumbo-grey"
          aria-hidden="true"
        />
        <span>{{ item.value }}</span>
        <span class="sr-only">
          {{ item.type === 'CITY' ? t('search.typeCity') : t('search.typeStore') }}
        </span>
      </template>
    </BaseList>

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
