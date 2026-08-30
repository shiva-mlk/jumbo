<script setup lang="ts">
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
</script>

<template>
  <nav :aria-label="t('locale.switch')">
    <ul class="flex items-center gap-1">
      <li
        v-for="option in locales"
        :key="option.code"
      >
        <NuxtLink
          :to="switchLocalePath(option.code)"
          class="rounded px-2 py-1 text-sm font-semibold text-jumbo-black"
          :class="
            option.code === locale
              ? 'bg-jumbo-black text-white'
              : 'hover:bg-jumbo-black/10'
          "
          :aria-current="option.code === locale ? 'true' : undefined"
        >
          <span aria-hidden="true">{{ option.code.toUpperCase() }}</span>
          <span class="sr-only">{{ option.name }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
