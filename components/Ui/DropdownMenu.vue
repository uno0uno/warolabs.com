<template>
  <DropdownMenuRoot v-model:open="open">
    <DropdownMenuTrigger as-child>
      <slot name="trigger">
        <button
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          Options
          <ChevronDownIcon class="ml-2 h-4 w-4" />
        </button>
      </slot>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent
      class="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      :side-offset="4"
    >
      <slot>
        <DropdownMenuItem class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator class="-mx-1 my-1 h-px bg-muted" />
        <DropdownMenuItem class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
          Logout
        </DropdownMenuItem>
      </slot>
    </DropdownMenuContent>
  </DropdownMenuRoot>
</template>

<script setup>
import { ref } from 'vue'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from 'radix-vue'
import { ChevronDownIcon } from 'lucide-vue-next'

const open = ref(false)
</script>