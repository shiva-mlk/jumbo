<script setup lang="ts">
import type { Commerce, Facilities } from '#shared/types/store'

const props = defineProps<{
  facilities: Facilities
  commerce: Commerce
}>()

const { t } = useI18n()

const FACILITY_ICONS: Partial<Record<keyof Facilities, string>> = {
  cookingStudio: 'lucide:chef-hat',
  dryCleaning: 'lucide:shirt',
  flowers: 'lucide:flower-2',
  kitchen: 'lucide:utensils',
  liquorService: 'lucide:wine',
  pharmacy: 'lucide:pill',
  photoService: 'lucide:camera',
  postOffice: 'lucide:mail',
  selfCheckout: 'lucide:scan-line',
  selfScan: 'lucide:scan-barcode',
  wifi: 'lucide:wifi'
}

const available = computed(() =>
  (Object.keys(FACILITY_ICONS) as (keyof Facilities)[])
    .filter((key) => props.facilities[key] === true)
    .map((key) => ({
      key,
      icon: FACILITY_ICONS[key]!,
      label: t(`facilities.${key}`)
    }))
)

const services = computed(() =>
  (['inStore', 'homeDelivery', 'collection'] as const).map((key) => ({
    key,
    label: t(`commerce.${key}`),
    available: props.commerce[key].available
  }))
)
</script>

<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-sm font-bold text-jumbo-black">
        {{ t('store.facilities') }}
      </h3>

      <BaseList
        v-if="available.length"
        :items="available"
        :item-key="(facility) => facility.key"
        class="mt-2 flex flex-wrap gap-2"
      >
        <template #default="{ item }">
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-jumbo-grey-light px-3 py-1 text-sm text-jumbo-black"
          >
            <Icon
              :name="item.icon"
              class="size-4 text-jumbo-grey"
              aria-hidden="true"
            />
            {{ item.label }}
          </span>
        </template>
      </BaseList>

      <p v-else class="mt-2 text-sm text-jumbo-grey">
        {{ t('store.noFacilities') }}
      </p>
    </section>

    <section v-if="facilities.parking">
      <h3 class="text-sm font-bold text-jumbo-black">
        {{ t('facilities.parking') }}
      </h3>
      <p class="mt-1 text-sm text-jumbo-grey">
        {{ t(`parking.${facilities.parking}`, facilities.parking) }}
      </p>
    </section>

    <section>
      <h3 class="text-sm font-bold text-jumbo-black">
        {{ t('store.services') }}
      </h3>

      <BaseList
        :items="services"
        :item-key="(service) => service.key"
        class="mt-2 space-y-1"
      >
        <template #default="{ item }">
          <span class="flex items-center gap-2 text-sm">
            <Icon
              :name="item.available ? 'lucide:check' : 'lucide:x'"
              class="size-4 shrink-0"
              :class="item.available ? 'text-jumbo-green' : 'text-jumbo-grey'"
              aria-hidden="true"
            />
            <span
              :class="item.available ? 'text-jumbo-black' : 'text-jumbo-grey'"
            >
              {{ item.label }}
            </span>
            <span class="sr-only">
              {{
                item.available ? t('common.available') : t('common.unavailable')
              }}
            </span>
          </span>
        </template>
      </BaseList>
    </section>
  </div>
</template>
