<template>
  <article ref="articleRef" class="max-w-none text-text-body">
    <div class="markdown-body" v-html="renderedContent" />
  </article>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import { computed, onMounted, onUnmounted, nextTick, ref } from 'vue';

interface Props {
  content: string;
  slug?: string;
}
const props = withDefaults(defineProps<Props>(), { slug: '' });

const md = new MarkdownIt({ html: false, linkify: true, typographer: true, breaks: true });
md.renderer.rules.table_open = () => '<div class="markdown-table-scroll"><table>';
md.renderer.rules.table_close = () => '</table></div>';
const renderedContent = computed(() => md.render(props.content ?? ''));

const articleRef = ref<HTMLElement | null>(null);
const leadModal = useLeadModal();
const insertedBanners: HTMLElement[] = [];

function buildBanner(placement: 'benefit' | 'price' | 'final', source: string, index: number): HTMLElement {
  const wrap = document.createElement('aside');
  wrap.setAttribute('data-mid-cta', '');
  wrap.setAttribute('data-mid-cta-position', String(index + 1));

  const content = document.createElement('div');
  content.setAttribute('data-mid-cta-content', '');

  const eyebrow = document.createElement('span');
  eyebrow.setAttribute('data-mid-cta-eyebrow', '');
  eyebrow.textContent = 'Comunidad';

  const headline = document.createElement('p');
  headline.setAttribute('data-mid-cta-headline', '');
  headline.textContent = placement === 'final'
    ? 'Únete a la comunidad gratuita.'
    : 'Lo que aprendí construyendo software con IA.';

  const body = document.createElement('p');
  body.setAttribute('data-mid-cta-body', '');
  body.textContent = placement === 'final'
    ? 'Comparto en abierto lo que aprendo al construir software, IA y proyectos open source. Únete gratis, solo te pido tu correo.'
    : 'Te envío por correo lo que voy aprendiendo al construir software, IA y proyectos open source. Una pieza corta, a la semana, sin relleno.';

  const microcopy = document.createElement('p');
  microcopy.setAttribute('data-mid-cta-microcopy', '');
  microcopy.textContent = 'Gratis · Sin spam · Cancela cuando quieras';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('data-blog-cta-btn', '');
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.textContent = 'Unirme gratis';
  btn.addEventListener('click', () => leadModal.open(source));

  content.appendChild(eyebrow);
  content.appendChild(headline);
  content.appendChild(body);
  content.appendChild(microcopy);
  wrap.appendChild(content);
  wrap.appendChild(btn);
  return wrap;
}

function getTargets(article: HTMLElement): HTMLElement[] {
  const headings = Array.from(article.querySelectorAll<HTMLElement>('h2'));
  if (headings.length <= 2) return headings.slice(1, 2);
  const first = headings[1];
  const second = headings[Math.max(2, Math.floor(headings.length * 0.62))];
  return Array.from(new Set([first, second])).slice(0, 2);
}

onMounted(() => {
  nextTick(() => {
    if (!articleRef.value || !props.slug) return;
    const targets = getTargets(articleRef.value);
    const source = `blog:community:${props.slug}`;
    targets.forEach((h2, index) => {
      const placement: 'benefit' | 'price' = index === 0 ? 'benefit' : 'price';
      const banner = buildBanner(placement, source, index);
      h2.parentNode?.insertBefore(banner, h2);
      insertedBanners.push(banner);
    });
  });
});

onUnmounted(() => {
  insertedBanners.splice(0).forEach((node) => node.remove());
});
</script>

<style scoped>
:deep([data-mid-cta]) {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  margin: 1.25rem 0;
  border: 1px solid color-mix(in srgb, var(--accent-lime) 55%, transparent);
  border-radius: 0.5rem;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent-lime) 22%, var(--bg-surface)) 0%, var(--bg-surface) 58%),
    var(--bg-surface);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.05);
}
:deep(.dark [data-mid-cta]) {
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
}
:deep([data-mid-cta-content]) {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
:deep([data-mid-cta-eyebrow]) {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 22px;
  padding: 0 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 999px;
  background-color: var(--accent-lime);
  color: #2d2d2e;
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
:deep([data-mid-cta-headline]) {
  margin: 0 !important;
  color: var(--text-main) !important;
  font-family: 'Asul', Georgia, serif;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3 !important;
  letter-spacing: -0.005em;
}
:deep([data-mid-cta-body]) {
  margin: 0.25rem 0 0 !important;
  color: var(--text-secondary) !important;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.45 !important;
}
:deep([data-mid-cta-microcopy]) {
  margin: 0.375rem 0 0 !important;
  color: var(--text-secondary) !important;
  opacity: 0.85;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.5 !important;
}
:deep([data-blog-cta-btn]) {
  flex-shrink: 0;
  align-self: flex-start;
  min-height: 38px;
  padding: 0.5rem 0.875rem;
  border: none;
  border-radius: 0.4375rem;
  background-color: var(--accent-lime);
  color: #2d2d2e;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  transition: filter 120ms ease, transform 80ms ease;
}
:deep([data-blog-cta-btn]:hover) {
  filter: brightness(0.96);
}
:deep([data-blog-cta-btn]:active) {
  transform: scale(0.98);
}
:deep([data-blog-cta-btn]:focus-visible) {
  outline: 2px solid var(--accent-text);
  outline-offset: 3px;
}
/* Reduce el espacio excesivo del CSS global .markdown-body entre el banner
   y el párrafo anterior / el H2 siguiente. */
:deep([data-mid-cta] + h2) {
  margin-top: 0.75em !important;
}
:deep(p + [data-mid-cta]) {
  margin-top: 1rem;
}
@media (max-width: 639px) {
  :deep([data-mid-cta]) {
    flex-direction: column;
    gap: 0.875rem;
    padding: 1rem;
  }
  :deep([data-blog-cta-btn]) {
    width: 100%;
    text-align: center;
  }
}
</style>

<style>
.markdown-body :where(h1, h2, h3, h4) {
  color: var(--text-main);
  font-weight: 700;
  margin-top: 2.5em !important;
  margin-bottom: 0.85em !important;
  line-height: 1.25;
  overflow-wrap: break-word;
  word-break: break-word;
}
.markdown-body h1 { font-size: 1.75rem; margin-top: 1.5em !important; }
.markdown-body h2 { font-size: 1.375rem; }
.markdown-body h3 { font-size: 1.125rem; }
.markdown-body p { margin: 2.5em 0 !important; color: var(--text-body); line-height: 1.7 !important; overflow-wrap: break-word; }
.markdown-body a { color: var(--accent-text); text-decoration: underline; word-break: break-word; }
.markdown-body code { font-family: var(--font-mono); background: var(--glass-bg); padding: 0.125rem 0.375rem; border-radius: 0.25rem; word-break: break-word; }
.markdown-body pre { background: var(--bg-surface); padding: 1.25rem; border-radius: 0.5rem; overflow-x: auto; margin: 2em 0 !important; }
.markdown-body pre code { background: transparent; padding: 0; }
.markdown-body ul, .markdown-body ol { padding-left: 1.5rem; color: var(--text-body); margin: 2em 0 !important; }
.markdown-body li { margin: 0.6em 0; line-height: 1.7; }
.markdown-body blockquote { border-left: 3px solid var(--accent-text); padding-left: 1.25rem; color: var(--text-secondary); font-style: italic; margin: 2em 0 !important; }
.markdown-body .markdown-table-scroll { width: 100%; overflow-x: auto; margin: 2em 0 !important; overscroll-behavior-inline: contain; -webkit-overflow-scrolling: touch; }
.markdown-body table { width: max-content; min-width: 100%; border-collapse: collapse; table-layout: auto; margin: 0 !important; }
.markdown-body th, .markdown-body td { min-width: 9rem; max-width: 18rem; border: 1px solid var(--glass-border); padding: 0.6rem 0.9rem; line-height: 1.6; word-break: normal; overflow-wrap: break-word; }
</style>
