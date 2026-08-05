<template>
  <aside data-mid-cta data-mid-cta-position="final" class="mt-12">
    <div data-mid-cta-content>
      <span data-mid-cta-eyebrow>Comunidad</span>
      <p data-mid-cta-headline>Únete a la comunidad gratuita.</p>
      <p data-mid-cta-body>
        Comparto en abierto lo que aprendo al construir software, IA y proyectos open source. Únete gratis, solo te pido tu correo.
      </p>
      <p data-mid-cta-microcopy>Gratis · Sin spam · Cancela cuando quieras</p>
    </div>
    <button
      type="button"
      data-blog-cta-btn
      aria-haspopup="dialog"
      @click="openModal"
    >
      Unirme gratis
    </button>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{ slug?: string }>();
const leadModal = useLeadModal();

function openModal() {
  if (!props.slug) return;
  leadModal.open(`blog:community:${props.slug}`);
}
</script>

<style scoped>
aside[data-mid-cta] {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  margin-top: 3rem;
  border: 1px solid color-mix(in srgb, var(--accent-lime) 55%, transparent);
  border-radius: 0.5rem;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent-lime) 22%, var(--bg-surface)) 0%, var(--bg-surface) 58%),
    var(--bg-surface);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.05);
}
:global(.dark) aside[data-mid-cta] {
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
}
[data-mid-cta-content] {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
[data-mid-cta-eyebrow] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 22px;
  padding: 0 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 999px;
  background-color: var(--accent-lime);
  color: var(--accent-text);
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
[data-mid-cta-headline] {
  margin: 0;
  color: var(--text-main);
  font-family: 'Asul', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.005em;
}
[data-mid-cta-body] {
  margin: 0.375rem 0 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
}
[data-mid-cta-microcopy] {
  margin: 0.375rem 0 0;
  color: var(--text-secondary);
  opacity: 0.85;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.5;
}
[data-blog-cta-btn] {
  flex-shrink: 0;
  align-self: flex-start;
  min-height: 40px;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 0.4375rem;
  background-color: var(--accent-lime);
  color: var(--accent-text);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  transition: filter 120ms ease, transform 80ms ease;
}
[data-blog-cta-btn]:hover {
  filter: brightness(0.96);
}
[data-blog-cta-btn]:active {
  transform: scale(0.98);
}
[data-blog-cta-btn]:focus-visible {
  outline: 2px solid var(--accent-text);
  outline-offset: 3px;
}
@media (max-width: 639px) {
  aside[data-mid-cta] {
    flex-direction: column;
    gap: 0.875rem;
    padding: 1.25rem;
  }
  [data-blog-cta-btn] {
    width: 100%;
    text-align: center;
  }
}
</style>
