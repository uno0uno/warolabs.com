<template>
  <DataTable :data="leadGroups" :columns="columns">
    <template #empty>
      <div class="flex flex-col items-center space-y-4 py-8">
        <Icon name="heroicons:user-group" class="h-12 w-12 text-muted-foreground" />
        <div class="text-center">
          <h3 class="text-lg font-medium text-muted-foreground mb-2">No hay grupos creados</h3>
          <p class="text-muted-foreground">Crea tu primer grupo de leads para comenzar a segmentar</p>
        </div>
      </div>
    </template>
  </DataTable>
</template>

<script setup>
import { h } from 'vue'
import DataTable from '@/components/Commons/DataTable.vue'

const props = defineProps({
  leadGroups: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['create', 'delete'])

// Define table columns
const columns = [
  {
    accessorKey: 'name',
    header: 'Grupo',
    cell: ({ row }) => {
      const group = row.original
      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'font-medium' }, group.name),
        group.description && h('span', { 
          class: 'text-sm text-muted-foreground' 
        }, group.description || 'Sin descripción')
      ])
    }
  },
  {
    accessorKey: 'member_count',
    header: 'Miembros',
    cell: ({ row }) => {
      const group = row.original
      return h('div', { class: 'text-center' }, [
        h('span', { 
          class: 'badge-primary' 
        }, group.member_count)
      ])
    }
  },
  {
    accessorKey: 'conversion_rate',
    header: 'Conversión',
    cell: ({ row }) => {
      const group = row.original
      return h('div', { class: 'text-center' }, [
        h('span', { class: 'text-sm font-semibold' }, `${group.conversion_rate}%`)
      ])
    }
  },
  {
    accessorKey: 'verified_count',
    header: 'Verificados',
    cell: ({ row }) => {
      const group = row.original
      return h('div', { class: 'text-center' }, [
        h('span', { class: 'text-sm font-semibold' }, group.verified_count)
      ])
    }
  },
  {
    accessorKey: 'recent_activity',
    header: 'Actividad Reciente',
    cell: ({ row }) => {
      const group = row.original
      return h('div', { class: 'text-center' }, [
        h('span', { class: 'text-sm' }, `${group.recent_activity?.recent_opens || 0} aperturas`)
      ])
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Creado',
    cell: ({ row }) => {
      const group = row.original
      return h('div', { class: 'text-center' }, [
        h('span', { class: 'text-sm text-muted-foreground' }, 
          new Date(group.created_at).toLocaleDateString()
        )
      ])
    }
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const group = row.original
      return h('div', { class: 'flex items-center justify-center space-x-2' }, [
        h('button', {
          onClick: (e) => {
            e.stopPropagation()
            emit('delete', group)
          },
          class: 'action-button text-destructive hover:text-destructive rounded-md',
          title: 'Eliminar grupo'
        }, [
          h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
            h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
          ])
        ])
      ])
    }
  }
]
</script>