<template>
  <div :class="cn('p-6 pt-0', $attrs.class)" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup>
import { cn } from "~/lib/utils"
</script>