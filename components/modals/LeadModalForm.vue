<template>
  <form v-if="state !== 'success'" class="flex flex-col gap-4" @submit.prevent="submit">
    <p class="text-sm leading-relaxed text-text-body">
      Solo te pido tu correo. Te aviso cuando publique algo nuevo. Gratis, sin spam.
    </p>

    <div>
      <label for="community-email" class="mb-1.5 block text-xs font-semibold text-text-body">Correo electrónico</label>
      <input
        id="community-email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        placeholder="tu@correo.com"
        :disabled="state === 'loading'"
        class="community-input"
      />
    </div>

    <p v-if="error" class="text-xs text-red-500 dark:text-red-400">{{ error }}</p>

    <button
      type="submit"
      :disabled="state === 'loading'"
      class="community-submit"
    >
      <span v-if="state === 'loading'">Enviando…</span>
      <span v-else>Unirme gratis</span>
    </button>
  </form>

  <div v-else class="flex flex-col items-center gap-4 py-4 text-center">
    <div class="community-success-icon" aria-hidden="true">✓</div>
    <div>
      <p class="text-base font-semibold text-text-main">¡Gracias! Te escribo pronto.</p>
      <p class="mt-1 text-sm leading-relaxed text-text-body">
        Revisa tu correo: te enviamos un mensaje de bienvenida. Sin spam, prometido.
      </p>
    </div>
    <button type="button" class="community-submit" @click="emit('close')">
      Cerrar
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ buttonSource: string }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const slug = computed(() => {
  const src = props.buttonSource || '';
  if (src.startsWith('blog:community:')) {
    return src.slice('blog:community:'.length);
  }
  // Fallback: use the source as-is if it is a safe slug (the server validates
  // [a-z0-9-]{1,200}); otherwise return 'unknown' so the form does not
  // silently break for non-blog call-sites (e.g. home CTA).
  return /^[a-z0-9-]{1,200}$/.test(src) ? src : 'unknown';
});

const email = ref('');
const state = ref<'idle' | 'loading' | 'success'>('idle');
const error = ref('');

async function submit() {
  error.value = '';
  if (!email.value) {
    error.value = 'Escribe tu correo.';
    return;
  }
  if (!slug.value) {
    error.value = 'No se pudo identificar el artículo.';
    return;
  }
  state.value = 'loading';
  try {
    const res = await $fetch<{ success: boolean }>('/api/marketing/createCommunityLead', {
      method: 'POST',
      body: {
        email: email.value,
        slug: slug.value,
        referrer: typeof window !== 'undefined' ? window.location.href : null,
      },
    });
    if (res?.success) {
      state.value = 'success';
    } else {
      state.value = 'idle';
      error.value = 'No pudimos registrarte. Intenta de nuevo.';
    }
  } catch (e: any) {
    state.value = 'idle';
    error.value = e?.data?.message || 'No pudimos registrarte. Intenta de nuevo.';
  }
}
</script>

<style scoped>
.community-input {
  width: 100%;
  min-height: 42px;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: var(--text-main);
  background-color: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 0.5rem;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.community-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}
.community-input:focus {
  outline: none;
  border-color: var(--accent-lime);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-lime) 35%, transparent);
}
.community-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.community-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 42px;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #2d2d2e;
  background-color: var(--accent-lime);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: filter 120ms ease, transform 80ms ease;
}
.community-submit:hover:not(:disabled) {
  filter: brightness(0.96);
}
.community-submit:active:not(:disabled) {
  transform: scale(0.99);
}
.community-submit:focus-visible {
  outline: 2px solid var(--accent-text);
  outline-offset: 3px;
}
.community-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.community-success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d2d2e;
  background-color: var(--accent-lime);
  border-radius: 9999px;
}
</style>
