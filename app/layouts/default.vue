<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-jumbo-black focus:px-4 focus:py-2 focus:text-white"
    >
      {{ t('app.skipToContent') }}
    </a>

    <header class="bg-jumbo-yellow">
      <div class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
        <NuxtLink
          :to="localePath('/')"
          class="text-2xl font-extrabold tracking-tight text-jumbo-black"
        >
          {{ t('app.name') }}
        </NuxtLink>
        <span class="text-lg font-medium text-jumbo-black/80">
          {{ t('app.section') }}
        </span>
        <LocaleSwitcher class="ml-auto" />
      </div>
    </header>

    <main id="main-content" class="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <slot />
    </main>

    <footer class="border-t border-jumbo-border bg-jumbo-grey-light">
      <div class="mx-auto max-w-6xl px-4 py-6 text-sm text-jumbo-grey">
        {{ t('app.footer') }}
      </div>
    </footer>
  </div>
</template>
