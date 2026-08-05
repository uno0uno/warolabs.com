<template>
  <nav aria-label="Breadcrumb" class="flex min-w-0 items-center gap-1.5 overflow-hidden text-sm">
    <template v-for="(item, index) in breadcrumbs" :key="index">
      <NuxtLink
        v-if="index === 0"
        :to="item.path || '/'"
        class="shrink-0 text-text-body transition-colors hover:text-accent"
        aria-label="Inicio"
      >
        <HomeIcon class="h-4 w-4" />
      </NuxtLink>

      <template v-else>
        <ChevronRightIcon class="h-4 w-4 shrink-0 text-text-body/60" />

        <NuxtLink
          v-if="item.path"
          :to="item.path"
          class="shrink-0 text-text-body transition-colors hover:text-accent"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          class="min-w-0 truncate font-medium text-main"
          aria-current="page"
        >
          {{ item.label }}
        </span>
      </template>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { HomeIcon, ChevronRightIcon } from '@heroicons/vue/20/solid';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const props = defineProps<{ current?: string }>();

const route = useRoute();

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const segments = route.path.split('/').filter(Boolean);

  const items: BreadcrumbItem[] = [{ label: 'Inicio', path: '/' }];

  segments.forEach((segment, index) => {
    let label = decodeURIComponent(segment).replace(/-/g, ' ');

    if (label.length > 40) {
      label = label.substring(0, 40).trim() + '...';
    }

    const path = index < segments.length - 1
      ? '/' + segments.slice(0, index + 1).join('/')
      : undefined;

    items.push({ label, path });
  });

  if (props.current && items.length > 0) {
    let label = props.current;
    if (label.length > 40) {
      label = `${label.substring(0, 40).trim()}...`;
    }
    items[items.length - 1] = { label };
  }

  return items;
});
</script>
