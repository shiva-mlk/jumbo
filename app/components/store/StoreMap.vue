<script setup lang="ts">
import type { Coordinates } from '#shared/types/store'

const props = defineProps<{
  coordinates: Coordinates
  name: string
}>()

const { t } = useI18n()

const ZOOM = 16

const center = computed<[number, number]>(() => [props.coordinates.lat, props.coordinates.lng])
</script>

<template>
  <ClientOnly>
    <LMap
      class="h-full min-h-80 w-full rounded-card"
      :zoom="ZOOM"
      :center="center"
      :use-global-leaflet="false"
      :aria-label="t('store.mapLabel', { name })"
    >
      <LTileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        layer-type="base"
        name="OpenStreetMap"
      />
      <LMarker :lat-lng="center" />
    </LMap>

    <template #fallback>
      <div
        class="h-full min-h-80 w-full animate-pulse rounded-card bg-jumbo-grey-light"
        aria-hidden="true"
      />
    </template>
  </ClientOnly>
</template>
