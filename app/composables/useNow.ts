// A clock that ticks once a minute,
// so that the store open/closed status can be reactive without a full page refresh.
export function useNow(intervalMs: number = 60_000) {
  const now = ref(new Date())

  onMounted(() => {
    const timer = setInterval(() => {
      now.value = new Date()
    }, intervalMs)

    onUnmounted(() => clearInterval(timer))
  })

  return now
}
