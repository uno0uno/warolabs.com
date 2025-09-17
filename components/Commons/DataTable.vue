<template>
  <div class="space-y-4">
    <!-- Search and Actions Bar like mockup -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-2">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            v-model="globalFilter"
            placeholder="Search by name, type or any other keyword"
            class="pl-10 pr-4 py-3 border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-80"
          />
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <Icon name="heroicons:squares-2x2" class="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
        <slot name="actions" />
      </div>
    </div>

    <!-- Table like mockup -->
    <div class="bg-background overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border">
            <th
              v-for="header in table.getFlatHeaders()"
              :key="header.id"
              :class="[
                'px-4 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                header.column.getCanSort() ? 'cursor-pointer select-none hover:text-foreground' : ''
              ]"
              @click="header.column.getCanSort() ? header.column.getToggleSortingHandler()?.($event) : undefined"
            >
              <div class="flex items-center space-x-2">
                {{ typeof header.column.columnDef.header === 'function' 
                    ? header.column.columnDef.header(header.getContext()) 
                    : header.column.columnDef.header }}
                <template v-if="header.column.getCanSort()">
                  <ChevronUpDownIcon v-if="!header.column.getIsSorted()" class="h-4 w-4" />
                  <ChevronUpIcon v-else-if="header.column.getIsSorted() === 'asc'" class="h-4 w-4" />
                  <ChevronDownIcon v-else class="h-4 w-4" />
                </template>
              </div>
            </th>
            <th class="px-4 py-4"></th>
          </tr>
        </thead>
        <tbody class="bg-background">
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="border-b border-border hover:bg-muted/30 transition-colors"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="px-4 py-4 text-sm font-medium"
            >
              <template v-if="typeof cell.column.columnDef.cell === 'function'">
                <component :is="cell.column.columnDef.cell({ row: cell.row, getValue: cell.getValue })" />
              </template>
              <template v-else>
                {{ cell.getValue() }}
              </template>
            </td>
            <td class="px-4 py-4">
              <Icon name="heroicons:ellipsis-vertical" class="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
            </td>
          </tr>
          <tr v-if="!table.getRowModel().rows.length">
            <td :colspan="table.getFlatHeaders().length + 1" class="px-4 py-12 text-center text-muted-foreground">
              <slot name="empty">
                <div class="flex flex-col items-center space-y-4">
                  <InboxIcon class="h-16 w-16 text-muted-foreground/50" />
                  <div>
                    <h3 class="text-lg font-medium text-muted-foreground mb-2">No hay datos</h3>
                    <p class="text-muted-foreground">No se encontraron resultados para mostrar</p>
                  </div>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Mostrando {{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 }} a 
        {{ Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length) }} 
        de {{ table.getFilteredRowModel().rows.length }} resultados
      </div>
      <div class="flex items-center space-x-2">
        <UiButton 
          variant="outline" 
          size="sm"
          @click="table.setPageIndex(0)"
          :disabled="!table.getCanPreviousPage()"
        >
          <ChevronDoubleLeftIcon class="h-4 w-4" />
        </UiButton>
        <UiButton 
          variant="outline" 
          size="sm"
          @click="table.previousPage()"
          :disabled="!table.getCanPreviousPage()"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </UiButton>
        <span class="text-sm text-muted-foreground px-2">
          Página {{ table.getState().pagination.pageIndex + 1 }} de {{ table.getPageCount() }}
        </span>
        <UiButton 
          variant="outline" 
          size="sm"
          @click="table.nextPage()"
          :disabled="!table.getCanNextPage()"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </UiButton>
        <UiButton 
          variant="outline" 
          size="sm"
          @click="table.setPageIndex(table.getPageCount() - 1)"
          :disabled="!table.getCanNextPage()"
        >
          <ChevronDoubleRightIcon class="h-4 w-4" />
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable
} from '@tanstack/vue-table'
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InboxIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  }
})

const globalFilter = ref('')

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  state: {
    get globalFilter() {
      return globalFilter.value
    }
  },
  onGlobalFilterChange: (value) => {
    globalFilter.value = value
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: {
    pagination: {
      pageSize: 10
    }
  }
})
</script>