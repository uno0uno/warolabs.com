<template>
  <DataTable :data="templates" :columns="columns">
    <template #empty>
      <div class="flex flex-col items-center space-y-4 py-8">
        <DocumentTextIcon class="h-12 w-12 text-muted-foreground" />
        <div class="text-center">
          <h3 class="text-lg font-medium text-muted-foreground">No hay templates de email</h3>
          <p class="text-muted-foreground mb-4">Crea tu primer template para comenzar</p>
          <UiButton @click="$emit('create')">
            Crear Primer Template
          </UiButton>
        </div>
      </div>
    </template>
  </DataTable>
</template>

<script setup>
import { h } from 'vue'
import DataTable from '@/components/Commons/DataTable.vue'
import { 
  DocumentTextIcon, 
  PencilIcon,
  CalendarIcon,
  TagIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  templates: {
    type: Array,
    required: true
  },
  deletingTemplate: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['create', 'edit', 'view', 'delete'])

// Define las columnas de la tabla
const columns = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => {
      const template = row.original
      // Muestra el nombre y la descripción en la misma celda
      return h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'font-medium' }, template.name),
        template.description && h('span', { 
          class: 'text-sm text-muted-foreground max-w-xs truncate' 
        }, template.description)
      ])
    }
  },
  {
    accessorKey: 'template_type',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.original.template_type
      const typeLabels = {
        massive_email: 'Envío Masivo',
        landing_confirmation: 'Confirmación Landing',
        transactional_email: 'Transaccional',
        notification_email: 'Notificación',
        welcome_email: 'Bienvenida',
        email: 'Email Landing'
      }
      
      return h('div', { class: 'flex items-center gap-2 text-sm' }, [
        h('span', { class: 'px-2 py-1 text-xs rounded-full bg-primary/10 text-primary' }, typeLabels[type] || type)
      ])
    }
  },
  {
    accessorKey: 'sender_email',
    header: 'Remitente',
    cell: ({ row }) => {
      return h('span', { class: 'text-sm font-mono' }, row.original.sender_email || '-')
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Creado',
    cell: ({ row }) => {
      const dateString = row.original.created_at
      if (!dateString) return h('span', '-')
      const date = new Date(dateString)
      const formattedDate = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      
      return h('div', { class: 'flex items-center gap-2 text-sm text-muted-foreground' }, [
        h('span', formattedDate)
      ])
    }
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const template = row.original
      return h('div', { class: 'flex items-center gap-2' }, [
        h('button', {
          class: 'p-1 rounded hover:bg-muted transition-colors',
          onClick: () => emit('edit', template.id),
          title: 'Editar template'
        }, [
          h(PencilIcon, { class: 'w-4 h-4 text-muted-foreground hover:text-foreground' })
        ]),
        h('button', {
          class: `p-1 rounded transition-colors ${
            props.deletingTemplate === (template.pair_id || template.id)
              ? 'bg-destructive text-destructive-foreground cursor-not-allowed' 
              : 'hover:bg-destructive hover:text-destructive-foreground'
          }`,
          onClick: () => props.deletingTemplate !== (template.pair_id || template.id) && emit('delete', template),
          title: props.deletingTemplate === (template.pair_id || template.id) ? 'Eliminando...' : 'Eliminar template',
          disabled: props.deletingTemplate === (template.pair_id || template.id)
        }, [
          props.deletingTemplate === (template.pair_id || template.id)
            ? h('div', { class: 'animate-spin w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full' })
            : h(TrashIcon, { class: 'w-4 h-4 text-muted-foreground hover:text-destructive-foreground' })
        ])
      ])
    }
  }
]
</script>