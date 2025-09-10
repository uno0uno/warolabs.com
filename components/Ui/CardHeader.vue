<template>
  <div :class="cn('flex flex-col space-y-1.5 p-6', $attrs.class)" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup>
import { cn } from "~/lib/utils"
</script>