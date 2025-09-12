<template>
  <div class="space-y-4">
    <!-- Search and Actions Bar -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            v-model="globalFilter"
            placeholder="Buscar..."
            class="pl-9 pr-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <slot name="actions" />
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-md border border-border overflow-hidden">
      <table class="w-full border-collapse">
        <thead class="bg-muted">
          <tr>
            <th
              v-for="header in table.getFlatHeaders()"
              :key="header.id"
              :class="[
                'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-muted/80' : ''
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
          </tr>
        </thead>
        <tbody class="bg-background">
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="border-b border-border hover:bg-muted/50 transition-colors"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="px-4 py-3 text-sm"
            >
              <template v-if="typeof cell.column.columnDef.cell === 'function'">
                <component :is="cell.column.columnDef.cell({ row: cell.row, getValue: cell.getValue })" />
              </template>
              <template v-else>
                {{ cell.getValue() }}
              </template>
            </td>
          </tr>
          <tr v-if="!table.getRowModel().rows.length">
            <td :colspan="table.getFlatHeaders().length" class="px-4 py-8 text-center text-muted-foreground">
              <slot name="empty">
                <div class="flex flex-col items-center space-y-2">
                  <InboxIcon class="h-8 w-8 text-muted-foreground" />
                  <span>No se encontraron datos</span>
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