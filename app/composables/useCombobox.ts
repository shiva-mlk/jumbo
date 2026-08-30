import { computed, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'

export interface UseComboboxOptions<T> {
  items: Ref<readonly T[]>
  onSelect: (item: T) => void
  onSubmit?: () => void
}

export function useCombobox<T>(options: UseComboboxOptions<T>) {
  const { items, onSelect, onSubmit } = options

  const isOpen = ref(false)
  const activeIndex = ref(-1)
  const containerRef = ref<HTMLElement | null>(null)

  const hasItems = computed(() => items.value.length > 0)
  const isExpanded = computed(() => isOpen.value && hasItems.value)
  const activeItem = computed<T | undefined>(() =>
    activeIndex.value >= 0 ? items.value[activeIndex.value] : undefined
  )

  function open() {
    if (hasItems.value) isOpen.value = true
  }

  function close() {
    isOpen.value = false
    activeIndex.value = -1
  }

  function reset() {
    activeIndex.value = -1
    isOpen.value = true
  }

  function highlight(index: number) {
    activeIndex.value = index
  }

  function select(item: T) {
    onSelect(item)
    close()
  }

  function move(delta: number) {
    if (!hasItems.value) return

    isOpen.value = true

    const count = items.value.length
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
        const active = activeItem.value
        if (isOpen.value && active !== undefined) {
          event.preventDefault()
          select(active)
        } else {
          onSubmit?.()
          close()
        }
        break
      }
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'Tab':
        close()
        break
    }
  }

  // Clicking anywhere outside dismisses the popup, as the pattern requires.
  onMounted(() => {
    const handler = (event: MouseEvent) => {
      if (containerRef.value && !containerRef.value.contains(event.target as Node)) close()
    }

    document.addEventListener('click', handler)
    onUnmounted(() => document.removeEventListener('click', handler))
  })

  watch(items, (list) => {
    if (list.length === 0) activeIndex.value = -1
  })

  return {
    containerRef,
    isOpen,
    isExpanded,
    activeIndex,
    activeItem,
    hasItems,
    open,
    close,
    reset,
    highlight,
    select,
    move,
    onKeydown
  }
}
