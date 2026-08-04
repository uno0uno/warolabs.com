<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-2 py-8" aria-label="Paginación">
    <button
      type="button"
      class="rounded-lg border border-glass-border bg-surface/40 px-3 py-1.5 text-sm text-text-body transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="page <= 1"
      @click="emit('update:page', page - 1)"
    >
      Anterior
    </button>
    <span class="px-3 text-sm text-text-body">
      Página {{ page }} de {{ totalPages }}
    </span>
    <button
      type="button"
      class="rounded-lg border border-glass-border bg-surface/40 px-3 py-1.5 text-sm text-text-body transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="page >= totalPages"
      @click="emit('update:page', page + 1)"
    >
      Siguiente
    </button>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{ page: number; pageSize: number; total: number }>();
const emit = defineEmits<{ 'update:page': [value: number] }>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
</script>
