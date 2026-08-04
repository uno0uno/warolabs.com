<template>
  <figure class="my-8">
    <img :src="src" :alt="alt" class="w-full rounded-lg border border-glass-border" :class="aspectClass" loading="lazy" />
    <figcaption v-if="caption" class="mt-2 text-center text-sm text-text-body/80">{{ caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ src: string; alt: string; caption?: string; aspectRatio?: '16/9' | '4/3' | '1/1' }>(), {
  aspectRatio: '16/9',
});
const aspectClass = computed(() => `aspect-[${props.aspectRatio.replace('/', '/')}] object-cover`);
</script>
