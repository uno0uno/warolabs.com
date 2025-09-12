<template>

<Transition
  enter-active-class="transition-all duration-400 ease-out"
  enter-from-class="opacity-0 transform -translate-y-5"
  enter-to-class="opacity-100 transform translate-y-0"
  leave-active-class="transition-all duration-300 ease-in"
  leave-from-class="opacity-100 transform translate-y-0"
  leave-to-class="opacity-0 transform -translate-y-5"
>
  <div class="space-y-6">

    <CommonsTheLoadingOverlay v-if="loading" :show="loading" />

    <div v-else-if="!loading && !showEditModal && !showCreateForm">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold font-principal">Templates de Email</h2>
          <p class="text-sm text-muted-foreground">Gestiona templates para todos los tipos de email</p>
        </div>
        <UiButton @click="toggleCreateForm" :variant="showCreateForm ? 'outline' : 'default'" class="flex items-center gap-2">
          <PlusIcon v-if="!showCreateForm" class="w-4 h-4" />
          <XMarkIcon v-else class="w-4 h-4" />
          {{ showCreateForm ? 'Cancelar' : 'Nuevo Template' }}
        </UiButton>
      </div>

      <div >
        <TemplatesTable 
          :templates="templates" 
          @create="toggleCreateForm"
          @edit="editTemplate"
          @view="viewTemplate"
        />
      </div>
    </div>

    <div v-else-if="templates.length === 0 && !showCreateForm && !showEditModal" class="text-center py-12">
      <DocumentTextIcon class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 class="text-lg font-medium text-muted-foreground">No hay templates de email</h3>
      <p class="text-muted-foreground mb-4">Crea tu primer template para comenzar</p>
      <UiButton @click="toggleCreateForm">
        Crear Primer Template
      </UiButton>
    </div>

    <UiCard v-if="showCreateForm || showEditModal">
      <UiCardHeader>
        <div class="flex items-center gap-3">
          <UiButton v-if="showEditModal" variant="ghost" size="sm" @click="cancelForm" class="p-2">
            <ArrowLeftIcon class="w-4 h-4" />
          </UiButton>
          <UiCardTitle class="font-principal text-lg">{{ showEditModal ? 'Editar Template' : 'Nuevo Template' }}</UiCardTitle>
        </div>
      </UiCardHeader>
      <UiCardContent class="space-y-4">
        <div class="flex flex-col md:flex-row gap-6">
          <div class="flex flex-col gap-4 w-full md:w-1/2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Nombre del Template</label>
                <UiInput v-model="templateForm.name" placeholder="Ej: Newsletter mensual" class="h-10 w-full" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Asunto por Defecto</label>
                <UiInput v-model="templateForm.subject" placeholder="Asunto del email..." class="h-10 w-full" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Email Remitente</label>
                <UiInput v-model="templateForm.senderEmail" placeholder="noreply@ejemplo.com" type="email" class="h-10 w-full" />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Tipo de Template</label>
                <select 
                  v-model="templateForm.templateType" 
                  class="w-full h-10 p-2 border border-border rounded-md bg-background"
                >
                  <option value="massive_email">Envío Masivo</option>
                  <option value="landing_confirmation">Confirmación Landing</option>
                  <option value="transactional_email">Transaccional</option>
                  <option value="notification_email">Notificación</option>
                  <option value="welcome_email">Bienvenida</option>
                </select>
              </div>
            </div>

            <div v-if="showEditModal && templateVersions.length > 0">
              <label class="block text-sm font-medium mb-2">Seleccionar Versión para Editar</label>
              <select 
                v-model="selectedVersionId" 
                @change="loadSelectedVersion"
                class="w-full h-10 p-2 border border-border rounded-md bg-background"
              >
                <option v-for="version in templateVersions" :key="version.id" :value="version.id">
                  Versión {{ version.version_number }} - {{ formatDate(version.created_at) }}
                  {{ version.is_active ? ' (Activa)' : '' }}
                </option>
              </select>
            </div>

            <div class="flex flex-col h-full">
              <label class="block text-sm font-medium mb-2">Descripción</label>
              <textarea 
                v-model="templateForm.description" 
                class="w-full p-3 border border-border rounded-md bg-background h-full"
                rows="2"
                placeholder="Describe el propósito de este template..."
              ></textarea>
            </div>
          </div>  

          <div class="w-full md:w-1/2">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium">Contenido del Email</label>
              <div v-if="showEditModal && templateForm.activeVersionId" class="flex items-center gap-1 text-sm text-muted-foreground">
                <PencilIcon class="w-3 h-3" />
                Editando versión {{ getActiveVersionNumber() }}
              </div>
            </div>
            <QuillEditorClient v-model="templateForm.content" />
            <p class="text-sm text-muted-foreground mt-2 flex flex-wrap gap-2">
              <span>Variables:</span>
              <code class="bg-muted px-1 rounded">&#123;&#123;nombre&#125;&#125;</code>
              <code class="bg-muted px-1 rounded">&#123;&#123;email&#125;&#125;</code>
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <UiButton variant="outline" @click="cancelForm">
            Cancelar
          </UiButton>
          <UiButton @click="saveTemplate" :disabled="!templateForm.name || !templateForm.content">
            {{ showEditModal ? 'Guardar Cambios' : 'Crear Template' }}
          </UiButton>
        </div>
      </UiCardContent>
    </UiCard>

  </div>
</Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCampaignStore } from '~/store/useCampaignStore';
import { DocumentTextIcon, PlusIcon, XMarkIcon, ArrowLeftIcon, PencilIcon } from '@heroicons/vue/24/outline';
import { useTemplates } from '~/composables/useTemplates'; // Asegúrate de que la ruta sea correcta

const campaignStore = useCampaignStore();

const { 
  templates,
  loading: loadingList,
  loadingDetail,
  templateVersions,
  createTemplate, 
  updateTemplate, 
  loadTemplateList,
  loadTemplateById
} = useTemplates();

const loading = computed(() => loadingList.value);
const loadingTemplate = computed(() => loadingDetail.value);

onMounted(() => {
  loadTemplateList();
});

const showCreateForm = ref(false);
const showEditModal = ref(false);
const selectedVersionId = ref(null);

const templateForm = ref({
  id: null,
  name: '',
  description: '',
  subject: '',
  senderEmail: '',
  content: '',
  campaignId: campaignStore.selectedCampaignId || '',
  templateType: 'massive_email',
  activeVersionId: null
});

const selectedCampaignName = computed(() => {
  if (campaignStore.hasSelectedCampaign) {
    return campaignStore.getSelectedCampaign?.name || 'Campaña seleccionada';
  }
  return null;
});

const editTemplate = async (templateId) => {
  try {
    const detailedTemplate = await loadTemplateById(templateId);
    if (!detailedTemplate) {
      alert('No se pudo cargar el template.');
      return;
    }

    const activeVersion = detailedTemplate.versions.find(v => v.is_active) || detailedTemplate.versions[0];
    
    templateForm.value = {
      id: detailedTemplate.id,
      name: detailedTemplate.name,
      description: detailedTemplate.description,
      subject: detailedTemplate.subject_template,
      senderEmail: detailedTemplate.sender_email,
      content: activeVersion?.content || '',
      campaignId: '',
      templateType: detailedTemplate.template_type || 'massive_email',
      activeVersionId: activeVersion?.id || null
    };
    
    selectedVersionId.value = activeVersion?.id;
    
    showCreateForm.value = false;
    showEditModal.value = true;
  } catch (error) {
    console.error('Error al cargar el detalle del template:', error);
  }
};

const saveTemplate = async () => {
  try {
    const payload = {
      name: templateForm.value.name,
      description: templateForm.value.description,
      subject_template: templateForm.value.subject,
      sender_email: templateForm.value.senderEmail,
      content: templateForm.value.content,
      template_type: templateForm.value.templateType,
      campaign_id: templateForm.value.campaignId
    };

    if (showEditModal.value) {
      await updateTemplate(templateForm.value.id, payload);
    } else {
      await createTemplate(payload);
    }
    cancelForm();
  } catch (error) {
    console.error('Error guardando el template:', error);
    alert('Error al guardar el template.');
  }
};

const loadSelectedVersion = () => {
  const selectedVersion = templateVersions.value.find(v => v.id === selectedVersionId.value);
  if (selectedVersion) {
    templateForm.value.content = selectedVersion.content;
  }
};

const getActiveVersionNumber = () => {
  const activeVersion = templateVersions.value.find(v => v.id === templateForm.value.activeVersionId);
  return activeVersion?.version_number || 'N/A';
};

const viewTemplate = (templateId) => {
  editTemplate(templateId);
};

const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value;
  if (showCreateForm.value) {
    resetForm();
  }
};

const cancelForm = () => {
  showCreateForm.value = false;
  showEditModal.value = false;
  resetForm();
};

const resetForm = () => {
  templateForm.value = {
    id: null, name: '', description: '', subject: '', senderEmail: '',
    content: '', campaignId: campaignStore.selectedCampaignId || '',
    templateType: 'massive_email', activeVersionId: null
  };
  templateVersions.value = [];
  selectedVersionId.value = null;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};
</script>