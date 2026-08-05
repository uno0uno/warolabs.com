<template>
  <Teleport to="body">
    <Transition name="bs-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[1000] flex items-end justify-center sm:hidden"
        role="dialog"
        aria-modal="true"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" @click="$emit('update:modelValue', false)" />
        <div class="relative w-full rounded-t-2xl border-t border-glass-border bg-surface shadow-xl">
          <div class="mx-auto mt-2 h-1.5 w-12 rounded-full bg-glass-border" aria-hidden="true" />
          <button
            v-if="dismissible"
            type="button"
            class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-glass hover:text-main"
            aria-label="Cerrar"
            @click="$emit('update:modelValue', false)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
          <div v-if="title" class="px-6 pt-5 pb-2">
            <h2 class="text-lg font-bold text-main">{{ title }}</h2>
          </div>
          <div class="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean;
  title?: string;
  dismissible?: boolean;
}>(), {
  title: '',
  dismissible: true,
});

defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();
</script>

<style scoped>
.bs-fade-enter-active,
.bs-fade-leave-active {
  transition: opacity 200ms ease;
}
.bs-fade-enter-from,
.bs-fade-leave-to {
  opacity: 0;
}
</style>
