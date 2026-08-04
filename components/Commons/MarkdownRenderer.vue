<template>
  <div class="markdown-body" v-html="rendered" />
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it';

const props = defineProps<{ source: string }>();

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
});

const rendered = computed(() => md.render(props.source ?? ''));
</script>

<style>
.markdown-body :where(h1, h2, h3, h4) {
  color: var(--text-main);
  font-weight: 700;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.25;
}
.markdown-body h1 { font-size: 2rem; }
.markdown-body h2 { font-size: 1.5rem; }
.markdown-body h3 { font-size: 1.25rem; }
.markdown-body p { margin: 1em 0; color: var(--text-body); }
.markdown-body a { color: var(--accent-text); text-decoration: underline; }
.markdown-body code { font-family: var(--font-mono); background: var(--glass-bg); padding: 0.125rem 0.375rem; border-radius: 0.25rem; }
.markdown-body pre { background: var(--bg-surface); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
.markdown-body pre code { background: transparent; padding: 0; }
.markdown-body ul, .markdown-body ol { padding-left: 1.5rem; color: var(--text-body); }
.markdown-body li { margin: 0.25em 0; }
.markdown-body blockquote { border-left: 3px solid var(--accent-text); padding-left: 1rem; color: var(--text-secondary); font-style: italic; }
.markdown-body table { width: 100%; border-collapse: collapse; }
.markdown-body th, .markdown-body td { border: 1px solid var(--glass-border); padding: 0.5rem 0.75rem; }
</style>
