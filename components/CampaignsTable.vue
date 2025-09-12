<script setup>
import { h } from 'vue'
import DataTable from '@/components/Commons/DataTable.vue'
import { 
  PlusIcon, 
  MegaphoneIcon, 
  PencilIcon, 
  EyeIcon,
  CalendarIcon,
  TagIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  campaigns: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['create', 'edit', 'view'])

// Define table columns
const columns = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => {
      const campaign = row.original
      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'font-medium' }, campaign.name),
        campaign.description && h('span', { 
          class: 'text-sm text-muted-foreground' 
        }, campaign.description)
      ])
    }
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.original.status
      const statusColors = {
        draft: 'bg-gray-100 text-gray-800',
        active: 'bg-green-100 text-green-800',
        paused: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-blue-100 text-blue-800'
      }
      const statusLabels = {
        draft: 'Borrador',
        active: 'Activa',
        paused: 'Pausada',
        completed: 'Completada'
      }
      
      return h('span', { 
        class: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}` 
      }, statusLabels[status] || status)
    }
  },
  {
    accessorKey: 'lead_count',
    header: 'Leads',
    cell: ({ row }) => {
      const count = row.original.total_leads || 0
      return h('div', { class: 'flex items-center gap-2 text-sm' }, [
        h('span', { class: 'font-medium' }, count.toString())
      ])
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Creada',
    cell: ({ row }) => {
      const date = new Date(row.original.created_at)
      return h('div', { class: 'flex items-center gap-2 text-sm text-muted-foreground' }, [
        h('span', date.toLocaleDateString('es-ES'))
      ])
    }
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const campaign = row.original
      return h('div', { class: 'flex items-center gap-2' }, [
        // Botón de ver (redireccionado)
        h(resolveComponent('NuxtLink'), {
          to: `${campaign.website}/landing/${campaign.slug}`,
          target: '_blank',
          class: 'p-1 rounded hover:bg-muted transition-colors',
          title: 'Ver Landing Page'
        }, [
          h(EyeIcon, { class: 'w-4 h-4 text-muted-foreground hover:text-foreground' })
        ]),
        // Botón de editar (mantiene el emit)
        h('button', {
          class: 'p-1 rounded hover:bg-muted transition-colors',
          onClick: () => emit('edit', campaign),
          title: 'Editar campaña'
        }, [
          h(PencilIcon, { class: 'w-4 h-4 text-muted-foreground hover:text-foreground' })
        ])
      ])
    }
  }
]
</script>

<template>
  <DataTable :data="campaigns" :columns="columns">
    <template #empty>
      <div class="flex flex-col items-center space-y-4 py-8">
        <MegaphoneIcon class="h-12 w-12 text-muted-foreground" />
        <div class="text-center">
          <h3 class="text-lg font-medium text-muted-foreground mb-2">No hay campañas</h3>
          <p class="text-muted-foreground mb-4">Crea tu primera campaña para comenzar con el marketing</p>
          <UiButton @click="$emit('create')">
            Crear Primera Campaña
          </UiButton>
        </div>
      </div>
    </template>
  </DataTable>
</template>