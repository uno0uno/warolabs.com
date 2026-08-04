<template>
  <form class="flex w-full items-center gap-2" role="search" @submit.prevent="onSubmit">
    <label for="blog-search" class="sr-only">Buscar artículos</label>
    <div class="relative w-full">
      <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-body/60" />
      <input
        id="blog-search"
        v-model="query"
        type="search"
        placeholder="Buscar artículos…"
        class="w-full rounded-lg border border-glass-border bg-surface/40 py-2 pl-10 pr-4 text-sm text-main placeholder:text-text-body/60 focus:border-accent focus:outline-none"
      />
    </div>
    <button
      type="submit"
      class="btn-primary"
      :disabled="!query.trim()"
    >
      Buscar
    </button>
  </form>
</template>

<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string]; search: [value: string] }>();

const query = ref(props.modelValue ?? '');

watch(() => props.modelValue, (v) => { if (v !== query.value) query.value = v; });

function onSubmit() {
  const value = query.value.trim();
  emit('update:modelValue', value);
  emit('search', value);
}
</script>
