<template>
  <h3 :class="cn('text-2xl font-semibold leading-none tracking-tight', $attrs.class)" v-bind="$attrs">
    <slot />
  </h3>
</template>

<script setup>
import { cn } from "~/lib/utils"
</script>