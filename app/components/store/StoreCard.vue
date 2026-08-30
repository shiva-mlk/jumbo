<script setup lang="ts">
import type { Store } from '#shared/types/store'

defineProps<{
  store: Store
  now: Date
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <article
    class="flex h-full flex-col gap-3 rounded-card border border-jumbo-border bg-white p-4 transition-shadow hover:shadow-md"
  >
    <div>
      <h2 class="text-base font-bold text-jumbo-black">
        <NuxtLink
          :to="localePath(`/stores/${store.id}`)"
          class="hover:underline"
        >
          {{ store.name }}
        </NuxtLink>
      </h2>

      <address class="mt-1 text-sm not-italic text-jumbo-grey">
        {{ store.address.formatted }}<br >
        {{ store.address.postalCode }} {{ store.address.city }}
      </address>
    </div>

    <OpenStatusBadge
      :opening-hours="store.openingHours"
      :now="now"
    />

    <a
      v-if="store.websiteUrl"
      :href="store.websiteUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="mt-auto inline-flex w-fit items-center gap-1 text-sm font-semibold text-jumbo-black underline underline-offset-2"
    >
      {{ t('store.visitWebsite') }}
      <Icon
        name="lucide:external-link"
        class="size-4"
        aria-hidden="true"
      />
      <span class="sr-only">{{ t('common.opensInNewTab') }}</span>
    </a>
  </article>
</template>
