<script setup lang="ts">
// Keeps <html lang> and the alternate-language link tags in step with the
// active locale, which a hardcoded lang attribute could not do.
const head = useLocaleHead()

useHead(head)
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
