import { getCurrentScope, onScopeDispose, ref, watch, type Ref } from 'vue'

export function useDebouncedRef<T>(source: Ref<T>, delay: number = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | undefined

  const clear = () => {
    if (timeout !== undefined) {
      clearTimeout(timeout)
      timeout = undefined
    }
  }

  const stop = watch(
    source,
    (value) => {
      clear()

      if (delay <= 0) {
        debounced.value = value
        return
      }

      timeout = setTimeout(() => {
        debounced.value = value
        timeout = undefined
      }, delay)
    },
    { flush: 'sync' }
  )

  if (getCurrentScope()) {
    onScopeDispose(() => {
      clear()
      stop()
    })
  }

  return debounced
}
