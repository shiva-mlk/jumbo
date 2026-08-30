<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <p
    class="rounded-card border border-jumbo-border bg-jumbo-grey-light p-6 text-jumbo-grey"
    role="status"
  >
    {{ message }}
  </p>
</template>
