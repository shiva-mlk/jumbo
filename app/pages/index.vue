<script setup lang="ts">
// Placeholder home page: the store overview replaces this in the next step.
const { t } = useI18n()

useHead({ title: () => `${t('app.name')} ${t('stores.title')}` })
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-jumbo-black">{{ t('stores.title') }}</h1>
    <p class="mt-2 text-jumbo-grey">{{ t('stores.placeholder') }}</p>
  </div>
</template>
