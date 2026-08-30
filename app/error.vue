<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const localePath = useLocalePath()

const isNotFound = computed(() => props.error.statusCode === 404)

function goHome() {
  return clearError({ redirect: localePath('/') })
}

useHead(useLocaleHead())

useHead({
  title: () =>
    `${props.error.statusCode} ${isNotFound.value ? t('error.notFoundTitle') : t('error.genericTitle')} | ${t('app.name')}`
})
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto max-w-xl py-12 text-center">
      <p class="text-5xl font-extrabold text-jumbo-yellow-dark">
        {{ error.statusCode }}
      </p>

      <h1 class="mt-4 text-2xl font-bold text-jumbo-black">
        {{ isNotFound ? t('error.notFoundTitle') : t('error.genericTitle') }}
      </h1>

      <p class="mt-2 text-jumbo-grey">
        {{ isNotFound ? t('error.notFoundBody') : t('error.genericBody') }}
      </p>

      <BaseButton class="mt-6" @click="goHome">
        {{ t('error.backHome') }}
      </BaseButton>
    </div>
  </NuxtLayout>
</template>
