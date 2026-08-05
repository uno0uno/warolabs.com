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
  margin-top: 2.5em !important;
  margin-bottom: 0.85em !important;
  line-height: 1.25;
}
.markdown-body h1 { font-size: 2rem; margin-top: 1.5em !important; }
.markdown-body h2 { font-size: 1.5rem; }
.markdown-body h3 { font-size: 1.25rem; }
.markdown-body p { margin: 2.5em 0 !important; color: var(--text-body); line-height: 1.7 !important; }
.markdown-body a { color: var(--accent-text); text-decoration: underline; }
.markdown-body code { font-family: var(--font-mono); background: var(--glass-bg); padding: 0.125rem 0.375rem; border-radius: 0.25rem; }
.markdown-body pre { background: var(--bg-surface); padding: 1.25rem; border-radius: 0.5rem; overflow-x: auto; margin: 2em 0 !important; }
.markdown-body pre code { background: transparent; padding: 0; }
.markdown-body ul, .markdown-body ol { padding-left: 1.5rem; color: var(--text-body); margin: 2em 0 !important; }
.markdown-body li { margin: 0.6em 0; line-height: 1.7; }
.markdown-body blockquote { border-left: 3px solid var(--accent-text); padding-left: 1.25rem; color: var(--text-secondary); font-style: italic; margin: 2em 0 !important; }
.markdown-body table { width: 100%; border-collapse: collapse; margin: 2em 0 !important; }
.markdown-body th, .markdown-body td { border: 1px solid var(--glass-border); padding: 0.6rem 0.9rem; line-height: 1.6; }
</style>
