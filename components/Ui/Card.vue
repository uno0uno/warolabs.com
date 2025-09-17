<template>
  <div :class="cn('border bg-card text-card-foreground shadow-sm', $attrs.class)" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup>
import { cn } from "~/lib/utils"
</script>