<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    message?: string
    retryable?: boolean
  }>(),
  { title: undefined, message: undefined, retryable: true }
)

const emit = defineEmits<{ retry: [] }>()

const { t } = useI18n()
</script>

<template>
  <div
    class="rounded-card border border-jumbo-red/30 bg-jumbo-red/5 p-6"
    role="alert"
  >
    <h2 class="font-bold text-jumbo-red">
      {{ title ?? t('stores.errorTitle') }}
    </h2>
    <p class="mt-1 text-sm text-jumbo-black">
      {{ message ?? t('stores.errorBody') }}
    </p>
    <BaseButton
      v-if="retryable"
      class="mt-4"
      @click="emit('retry')"
    >
      {{ t('common.retry') }}
    </BaseButton>
  </div>
</template>
