<script setup lang="ts">
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
</script>

<template>
  <nav :aria-label="t('locale.switch')">
    <BaseList
      :items="locales"
      :item-key="(option) => option.code"
      class="flex items-center gap-1"
    >
      <template #default="{ item }">
        <NuxtLink
          :to="switchLocalePath(item.code)"
          class="rounded px-2 py-1 text-sm font-semibold text-jumbo-black"
          :class="
            item.code === locale ? 'bg-jumbo-black text-white' : 'hover:bg-jumbo-black/10'
          "
          :aria-current="item.code === locale ? 'true' : undefined"
        >
          <span aria-hidden="true">{{ item.code.toUpperCase() }}</span>
          <span class="sr-only">{{ item.name }}</span>
        </NuxtLink>
      </template>
    </BaseList>
  </nav>
</template>
