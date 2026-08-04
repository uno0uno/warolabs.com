<template>
  <div class="flex flex-col gap-4 border-b border-glass-border py-6 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="rounded-full border px-4 py-1.5 text-sm font-medium transition"
        :class="!activePillar ? 'border-accent bg-accent text-white' : 'border-glass-border bg-surface/40 text-text-body hover:border-accent'"
        @click="selectPillar(null)"
      >
        Todos
      </button>
      <button
        v-for="pillar in BLOG_PILLARS"
        :key="pillar.value"
        type="button"
        class="rounded-full border px-4 py-1.5 text-sm font-medium transition"
        :class="activePillar === pillar.value ? 'border-accent bg-accent text-white' : 'border-glass-border bg-surface/40 text-text-body hover:border-accent'"
        @click="selectPillar(pillar.value)"
      >
        {{ pillar.label }}
      </button>
    </div>
    <div class="text-sm text-text-body/80">
      <span v-if="total !== null">{{ total }} artículo{{ total === 1 ? '' : 's' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BLOG_PILLARS, isBlogPillar, type BlogPillarValue } from '~/composables/useBlog';

const props = defineProps<{ modelValue: string | null; total?: number | null }>();
const emit = defineEmits<{ 'update:modelValue': [value: BlogPillarValue | null] }>();

const activePillar = computed(() => props.modelValue);

function selectPillar(value: string | null) {
  if (value === null) {
    emit('update:modelValue', null);
    return;
  }
  if (isBlogPillar(value)) {
    emit('update:modelValue', value);
  }
}
</script>
