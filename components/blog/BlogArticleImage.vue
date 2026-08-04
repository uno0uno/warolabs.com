<template>
  <figure class="my-8">
    <img
      :src="src"
      :alt="alt"
      class="w-full rounded-lg border border-glass-border object-cover"
      :class="aspectClass"
      loading="lazy"
    />
    <figcaption v-if="caption" class="mt-2 text-center text-sm text-text-body/80">{{ caption }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{ src: string; alt: string; caption?: string; aspectRatio?: '16/9' | '4/3' | '1/1' }>(),
  { aspectRatio: '16/9' }
);

const aspectClass = computed(() => {
  switch (props.aspectRatio) {
    case '4/3': return 'aspect-[4/3]';
    case '1/1': return 'aspect-square';
    case '16/9':
    default: return 'aspect-video';
  }
});
</script>
