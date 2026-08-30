<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'square'
    active?: boolean
    disabled?: boolean
  }>(),
  { variant: 'primary', active: false, disabled: false }
)
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="cursor-pointer rounded font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
    :class="[
      variant === 'primary'
        ? 'bg-jumbo-black px-4 py-2 text-sm text-white hover:bg-jumbo-black/80'
        : 'inline-flex size-9 items-center justify-center border text-sm',
      variant === 'square' && active
        ? 'border-jumbo-black bg-jumbo-black text-white'
        : '',
      variant === 'square' && !active
        ? 'border-jumbo-grey text-jumbo-black hover:bg-jumbo-grey-light'
        : ''
    ]"
  >
    <slot />
  </button>
</template>
