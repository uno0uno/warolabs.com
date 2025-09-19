<template>
  <div v-if="loading" class="space-y-6">
    <CommonsTheLoading />
  </div>
  
  <div v-else class="space-y-6">
    <!-- Header (always visible) -->
    <div v-if="!showEditModal && !showCreateForm && !showCreatePair" class="page-header">
      <div>
        <h2 class="page-title">Templates de Email</h2>
        <p class="page-description">Gestiona templates para todos los tipos de email</p>
      </div>
      <div class="flex gap-2">
        <UiButton @click="toggleCreateForm" :variant="showCreateForm ? 'outline' : 'default'" class="flex items-center gap-2">
          <PlusIcon v-if="!showCreateForm" class="w-4 h-4" />
          <XMarkIcon v-else class="w-4 h-4" />
          {{ showCreateForm ? 'Cancelar' : 'Nuevo Template' }}
        </UiButton>
        <UiButton @click="toggleCreatePair" :variant="showCreatePair ? 'outline' : 'secondary'" class="flex items-center gap-2">
          <DocumentDuplicateIcon v-if="!showCreatePair" class="w-4 h-4" />
          <XMarkIcon v-else class="w-4 h-4" />
          {{ showCreatePair ? 'Cancelar' : 'Crear Par Email+Landing' }}
        </UiButton>
      </div>
    </div>

    <!-- Stats Overview -->
    <div v-if="!showEditModal && !showCreateForm && !showCreatePair" class="grid grid-cols-1 md:grid-cols-4 gap-6 section-spacing">
      <StatCard 
        :value="templates.length" 
        label="total templates" 
        icon="heroicons:document-text" 
      />
      <StatCard 
        :value="emailTemplates" 
        label="templates email" 
        icon="heroicons:envelope" 
      />
      <StatCard 
        :value="landingTemplates" 
        label="templates landing" 
        icon="heroicons:globe-alt" 
      />
      <StatCard 
        :value="templatePairs" 
        label="pares creados" 
        icon="heroicons:document-duplicate" 
      />
    </div>

      <!-- Table and content -->
      <div v-if="!showEditModal && !showCreateForm && !showCreatePair" class="section-spacing">
        <TemplatesTable 
          :templates="templates" 
          :deleting-template="deletingTemplateId"
          @create="toggleCreateForm"
          @edit="editTemplate"
          @view="viewTemplate"
          @delete="deleteTemplate"
        />
      </div>

      <Transition
        v-if="shouldShowEmptyState"
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 transform scale-95"
        enter-to-class="opacity-100 transform scale-100"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 transform scale-100"
        leave-to-class="opacity-0 transform scale-95"
      >
        <div class="text-center py-12">
          <DocumentTextIcon class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 class="text-lg font-medium text-muted-foreground">No hay templates de email</h3>
          <p class="text-muted-foreground mb-4">Crea tu primer template para comenzar</p>
          <UiButton @click="toggleCreateForm">
            Crear Primer Template
          </UiButton>
        </div>
      </Transition>

      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 transform -translate-y-5"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-5"
      >
        <UiCard v-if="showCreatePair" class="border-2 border-primary/20">
          <UiCardHeader>
            <div class="flex items-center gap-3">
              <UiButton variant="ghost" size="sm" @click="cancelPairForm" class="p-2">
                <ArrowLeftIcon class="w-4 h-4" />
              </UiButton>
              <div>
                <UiCardTitle class="flex items-center gap-2">
                  <DocumentDuplicateIcon class="w-5 h-5 text-primary" />
                  {{ editingPair ? 'Editar Templates Email + Landing' : 'Crear Templates Email + Landing' }}
                </UiCardTitle>
                <p class="text-sm text-muted-foreground">{{ editingPair ? 'Edita ambos templates del par' : 'Crea ambos templates de una vez reutilizando información común' }}</p>
              </div>
            </div>
          </UiCardHeader>
          <UiCardContent>
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50">
                <div>
                  <label class="block text-sm font-medium mb-2">Nombre Base del Template</label>
                  <UiInput v-model="pairForm.template_name" placeholder="Ej: Asesoría Legal Gratis" class="h-10 w-full" :disabled="!!editingPair" />
                  <p class="text-xs text-muted-foreground mt-1" v-if="!editingPair">Se creará "[Nombre] - Email" y "[Nombre] - Landing"</p>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Email Remitente</label>
                  <UiInput v-model="pairForm.sender_email" placeholder="noreply@ejemplo.com" type="email" class="h-10 w-full" :disabled="!!editingPair"/>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium mb-2">Descripción General</label>
                  <UiInput v-model="pairForm.description" placeholder="Descripción que se usará para ambos templates" class="h-10 w-full" :disabled="!!editingPair"/>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <h3 class="text-lg font-medium flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                    Template de Email
                  </h3>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2">Asunto del Email</label>
                    <UiInput v-model="pairForm.subject_template" placeholder="¡Tu consulta está confirmada!" class="h-10 w-full" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Contenido del Email</label>
                    <QuillEditorClient v-model="pairForm.email_content" />
                    <p class="text-xs text-muted-foreground mt-1">Variables: <code class="bg-muted px-1 rounded-sm font-mono text-xs" v-text="'{{nombre}}'"></code>, <code class="bg-muted px-1 rounded-sm font-mono text-xs" v-text="'{{email}}'"></code></p>
                  </div>
                </div>

                <div class="space-y-4">
                  <h3 class="text-lg font-medium flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                    Template de Landing
                  </h3>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2">Título de la Landing</label>
                    <UiInput v-model="pairForm.landing_title" placeholder="No pagues de más por asesoría legal" class="h-10 w-full" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Descripción de la Landing</label>
                    <textarea 
                      v-model="pairForm.landing_description" 
                      class="w-full p-3 border border-border bg-background resize-none"
                      rows="4"
                      placeholder="Describe los beneficios de tu oferta..."
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">URL de la Imagen</label>
                    <UiInput v-model="pairForm.landing_image_url" placeholder="https://ejemplo.com/imagen.webp" type="url" class="h-10 w-full" />
                  </div>

                  <Transition
                    enter-active-class="transition-all duration-300 ease-out"
                    enter-from-class="opacity-0 transform scale-95"
                    enter-to-class="opacity-100 transform scale-100"
                    leave-active-class="transition-all duration-200 ease-in"
                    leave-from-class="opacity-100 transform scale-100"
                    leave-to-class="opacity-0 transform scale-95"
                  >
                    <div v-if="pairForm.landing_image_url" class="mt-2">
                      <img 
                        :src="pairForm.landing_image_url" 
                        :alt="pairForm.landing_title"
                        class="max-w-full h-auto shadow-sm max-h-32 object-cover"
                        @error="onImageError"
                      />
                    </div>
                  </Transition>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 p-4 border-t">
              <UiButton variant="outline" @click="cancelPairForm">
                Cancelar
              </UiButton>
              <CommonsLoadingButton 
                :text="editingPair ? 'Guardar Cambios' : 'Crear Ambos Templates'"
                :loading-text="editingPair ? 'Guardando...' : 'Creando...'"
                :loading="savingPair"
                :disabled="!isPairFormValid"
                @click="handleSubmitPair"
                class="bg-primary text-primary-foreground"
              />
            </div>
          </UiCardContent>
        </UiCard>
      </Transition>

    <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 transform -translate-y-5"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-5"
      >
        <UiCard v-if="showCreateForm || showEditModal">
          <UiCardHeader>
            <div class="flex items-center gap-3">
              <UiButton variant="ghost" size="sm" @click="cancelForm" class="p-2">
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
                      @change="onTemplateTypeChange"
                      class="w-full h-10 p-2 border border-border bg-background"
                    >
                      <option value="massive_email">Envío Masivo</option>
                    </select>
                  </div>
                </div>

                <!-- Solo mostrar campaña para templates que NO sean massive_email -->
                <div v-if="!showEditModal && templateForm.templateType !== 'massive_email'">
                  <label class="block text-sm font-medium mb-2">
                    Campaña <span class="text-destructive">*</span>
                  </label>
                  <select 
                    v-model="templateForm.campaignId" 
                    class="w-full h-10 p-2 border border-border bg-background"
                    :class="{ 'border-destructive': !templateForm.campaignId && showValidationError }"
                    required
                  >
                    <option value="">Selecciona una campaña...</option>
                    <option v-for="campaign in availableCampaigns" :key="campaign.id" :value="campaign.id">
                      {{ campaign.name }}
                    </option>
                  </select>
                  <p v-if="!templateForm.campaignId && showValidationError" class="text-sm text-destructive mt-1">
                    La selección de campaña es obligatoria
                  </p>
                  <p class="text-xs text-muted-foreground mt-1">
                    El template se asociará automáticamente con la campaña seleccionada
                  </p>
                </div>

                <!-- Mensaje informativo para templates masivos -->
                <div v-if="!showEditModal && templateForm.templateType === 'massive_email'" class="p-3 bg-green-50 border border-green-200 rounded">
                  <div class="flex items-center gap-2">
                    <div class="text-green-600">✓</div>
                    <div>
                      <div class="text-sm font-medium text-green-800">Template de Envío Masivo</div>
                      <div class="text-xs text-green-600">Este template quedará disponible para envío directo a grupos sin asociar a campañas</div>
                    </div>
                  </div>
                </div>

                <div v-if="shouldShowVersionSelector">
                  <label class="block text-sm font-medium mb-2">Seleccionar Versión para Editar</label>
                  <select 
                    v-model="selectedVersionId" 
                    @change="loadSelectedVersion"
                    class="w-full h-10 p-2 border border-border bg-background"
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
                    class="w-full p-3 border border-border bg-background h-full"
                    rows="2"
                    placeholder="Describe el propósito de este template..."
                  ></textarea>
                </div>
              </div>  

              <div class="w-full md:w-1/2">
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium">Contenido del Template</label>
                  <div v-if="showEditModal && templateForm.activeVersionId" class="flex items-center gap-1 text-sm text-muted-foreground">
                    <PencilIcon class="w-3 h-3" />
                    Editando versión {{ getActiveVersionNumber() }}
                  </div>
                </div>
                
                <QuillEditorClient v-model="templateForm.content" />
                <p class="text-sm text-muted-foreground mt-2 flex flex-wrap gap-2">
                  <span>Variables:</span>
                  <code class="bg-muted px-1 rounded-sm font-mono text-xs" v-text="'{{nombre}}'"></code>
                  <code class="bg-muted px-1 rounded-sm font-mono text-xs" v-text="'{{email}}'"></code>
                </p>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <UiButton variant="outline" @click="cancelForm">
                Cancelar
              </UiButton>
              <CommonsLoadingButton 
                :text="showEditModal ? 'Guardar Cambios' : 'Crear Template'"
                :loading-text="showEditModal ? 'Guardando...' : 'Creando...'"
                :loading="savingTemplate"
                :disabled="!templateForm.name || !templateForm.content || (!showEditModal && templateForm.templateType !== 'massive_email' && !templateForm.campaignId)"
                @click="saveTemplate"
                class="bg-primary text-primary-foreground"
              />
            </div>
          </UiCardContent>
        </UiCard>
      </Transition>

  </div>

  <!-- Delete Confirmation Modal -->
  <ConfirmDeleteModal
    :show="showDeleteModal"
    :template-info="deleteTemplateInfo"
    :loading="isDeletingTemplate"
    @confirm="confirmDeleteTemplate"
    @cancel="cancelDeleteTemplate"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCampaignStore } from '~/store/useCampaignStore';
import { DocumentTextIcon, PlusIcon, XMarkIcon, ArrowLeftIcon, PencilIcon, DocumentDuplicateIcon } from '@heroicons/vue/24/outline';
import ConfirmDeleteModal from '~/components/Commons/ConfirmDeleteModal.vue';
import { useTemplates } from '~/composables/useTemplates';
import { useToast } from '~/composables/useToast';
import StatCard from '@/components/Commons/StatCard.vue';

const campaignStore = useCampaignStore();
const toast = useToast();

const { 
  templates,
  loading: loadingList,
  loadingDetail,
  templateVersions,
  createTemplate, 
  updateTemplate, 
  deleteTemplate: deleteTemplateAPI,
  loadTemplateList,
  loadTemplateById,
  createTemplatePair,
  updateTemplatePair,
} = useTemplates();

const loading = computed(() => loadingList.value);
const loadingTemplate = computed(() => loadingDetail.value);

onMounted(() => {
  loadTemplateList();
  loadAvailableCampaigns();
});

const showCreateForm = ref(false);
const showEditModal = ref(false);
const showViewerModal = ref(false);
const showCreatePair = ref(false);
const selectedVersionId = ref(null);
const selectedTemplateId = ref(null);
const savingTemplate = ref(false);
const savingPair = ref(false);
const editingPair = ref(null);
const deletingTemplateId = ref(null);
const showDeleteModal = ref(false);
const templateToDelete = ref(null);
const isDeletingTemplate = ref(false);
const availableCampaigns = ref([]);
const showValidationError = ref(false);

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

const landingForm = ref({
  title: '',
  description: '',
  imageUrl: ''
});

const pairForm = ref({
  template_name: '',
  description: '',
  sender_email: '',
  subject_template: '',
  email_content: '',
  landing_title: '',
  landing_description: '',
  landing_image_url: ''
});

const selectedCampaignName = computed(() => {
  if (campaignStore.hasSelectedCampaign) {
    return campaignStore.getSelectedCampaign?.name || 'Campaña seleccionada';
  }
  return null;
});

const isPairFormValid = computed(() => {
  return pairForm.value.template_name.trim() &&
         pairForm.value.sender_email.trim() &&
         pairForm.value.subject_template.trim() &&
         pairForm.value.email_content.trim() &&
         pairForm.value.landing_title.trim() &&
         pairForm.value.landing_description.trim();
});

const shouldShowEmptyState = computed(() => {
  return templates.value.length === 0 && 
         !showCreateForm.value && 
         !showEditModal.value && 
         !showCreatePair.value && 
         !loadingTemplate.value &&
         !savingTemplate.value &&
         !savingPair.value;
});

const shouldShowVersionSelector = computed(() => {
  console.log('🔄 shouldShowVersionSelector computed:', {
    showEditModal: showEditModal.value,
    templateVersions: templateVersions.value,
    templateVersionsLength: templateVersions.value?.length || 0
  });
  return showEditModal.value && templateVersions.value && templateVersions.value.length > 0;
});

const deleteTemplateInfo = computed(() => {
  if (!templateToDelete.value) return { name: '', isPair: false, typeLabel: '' };
  
  const template = templateToDelete.value;
  
  if (template.is_pair) {
    return {
      name: template.name,
      isPair: true,
      typeLabel: ''
    };
  } else {
    const typeLabels = {
      massive_email: 'Envío Masivo',
      landing_confirmation: 'Confirmación Landing', 
      transactional_email: 'Transaccional',
      notification_email: 'Notificación',
      welcome_email: 'Bienvenida',
      email: 'Email Landing'
    };
    return {
      name: template.name,
      isPair: false,
      typeLabel: typeLabels[template.template_type] || template.template_type
    };
  }
});

const emailTemplates = computed(() => {
  return templates.value.filter(template => !template.is_pair && (template.template_type === 'massive_email' || template.template_type === 'email')).length;
});

const landingTemplates = computed(() => {
  return templates.value.filter(template => !template.is_pair && template.template_type === 'landing').length;
});

const templatePairs = computed(() => {
  return templates.value.filter(template => template.is_pair).length;
});

const editTemplate = async (templateId) => {
  try {
    const template = templates.value.find(t => t.id === templateId);
    
    if (template && template.is_pair) {
      await editTemplatePair(template);
      return;
    }
    
    const detailedTemplate = await loadTemplateById(templateId);
    
    if (!detailedTemplate) {
      toast.error('No se pudo cargar el template.');
      return;
    }

    const activeVersion = detailedTemplate.versions?.find(v => v.is_active) || detailedTemplate.versions?.[0];
    
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

const editTemplatePair = async (pairTemplate) => {
  try {
    const emailTemplate = pairTemplate.pair_templates.find(t => t.type === 'email');
    const landingTemplate = pairTemplate.pair_templates.find(t => t.type === 'landing');
    
    if (!emailTemplate || !landingTemplate) {
      toast.error('No se pudieron cargar los templates del par.');
      return;
    }
    
    const [emailDetails, landingDetails] = await Promise.all([
      loadTemplateById(emailTemplate.id),
      loadTemplateById(landingTemplate.id)
    ]);
    
    if (!emailDetails || !landingDetails) {
      toast.error('No se pudieron cargar los detalles de los templates.');
      return;
    }
    
    const emailActiveVersion = emailDetails.versions.find(v => v.is_active) || emailDetails.versions[0];
    const landingActiveVersion = landingDetails.versions.find(v => v.is_active) || landingDetails.versions[0];
    
    let landingContent = {};
    try {
      landingContent = JSON.parse(landingActiveVersion?.content || '{}');
    } catch (e) {
      console.warn("El contenido de la landing no es un JSON válido, se usará un objeto vacío.");
      landingContent = {};
    }
    
    pairForm.value = {
      template_name: pairTemplate.name,
      description: pairTemplate.description,
      sender_email: pairTemplate.sender_email,
      subject_template: emailDetails.subject_template,
      email_content: emailActiveVersion?.content || '',
      landing_title: landingContent.title || '',
      landing_description: landingContent.description || '',
      landing_image_url: landingContent.image?.content || ''
    };
    
    editingPair.value = {
      pair_id: pairTemplate.pair_id,
      email_template_id: emailTemplate.id,
      landing_template_id: landingTemplate.id
    };
    
    showCreatePair.value = true;
    showEditModal.value = false;
    showCreateForm.value = false;
    
  } catch (error) {
    console.error('Error al cargar el par de templates:', error);
    toast.error('Error al cargar el par de templates.');
  }
};

const handleSubmitPair = async () => {
  if (!isPairFormValid.value) return;

  savingPair.value = true;
  try {
    if (editingPair.value) {
      // MODO EDICIÓN
      const payload = {
        emailTemplateContent: pairForm.value.email_content,
        landingTemplateContent: JSON.stringify({
          title: pairForm.value.landing_title,
          description: pairForm.value.landing_description,
          image: { type: "image", content: pairForm.value.landing_image_url }
        }),
        subjectTemplate: pairForm.value.subject_template,
        emailTemplateName: `${pairForm.value.template_name} - Email`,
        landingTemplateName: `${pairForm.value.template_name} - Landing`,
      };
      
      await updateTemplatePair(editingPair.value.pair_id, payload);
      
      // Cerrar inmediatamente el modal de edición
      showCreatePair.value = false;
      editingPair.value = null;
      resetPairForm();
      
      // Mostrar toast de éxito
      toast.success('Par de plantillas actualizado con éxito');
      
      // Recargar la lista de templates
      await loadTemplateList();
      
    } else {
      // MODO CREACIÓN
      await createTemplatePair(pairForm.value);
      
      // Cerrar el modal de creación
      showCreatePair.value = false;
      resetPairForm();
      
      // Mostrar toast de éxito
      toast.success('Par de plantillas creado con éxito');
      
      // Recargar la lista de templates
      await loadTemplateList();
    }

  } catch (error) {
    console.error('Error al guardar el par:', error);
    toast.error(error.data?.statusMessage || 'No se pudo guardar el par de plantillas.');
  } finally {
    savingPair.value = false;
  }
};

const saveTemplate = async () => {
  // Validar que se haya seleccionado una campaña SOLO para templates que NO sean massive_email
  if (!showEditModal.value && templateForm.value.templateType !== 'massive_email' && !templateForm.value.campaignId) {
    showValidationError.value = true;
    toast.error('Debes seleccionar una campaña para el template');
    return;
  }

  try {
    savingTemplate.value = true;
    
    let content = templateForm.value.content;
    
    if (templateForm.value.templateType === 'landing') {
      content = JSON.stringify({
        title: landingForm.value.title,
        description: landingForm.value.description,
        image: {
          type: "image",
          content: landingForm.value.imageUrl
        }
      });
    }
    
    const payload = {
      name: templateForm.value.name,
      description: templateForm.value.description,
      subject_template: templateForm.value.subject,
      sender_email: templateForm.value.senderEmail,
      content: content,
      template_type: templateForm.value.templateType
    };

    // Solo incluir campaign_id para templates que NO sean massive_email
    if (templateForm.value.templateType !== 'massive_email') {
      payload.campaign_id = templateForm.value.campaignId;
    }

    if (showEditModal.value) {
      await updateTemplate(templateForm.value.id, payload);
      toast.success('Template actualizado exitosamente');
    } else {
      await createTemplate(payload);
      toast.success('Template creado exitosamente');
    }
    
    showCreateForm.value = false;
    showEditModal.value = false;
    
    setTimeout(async () => {
      await loadTemplateList();
      resetForm();
    }, 300);
  } catch (error) {
    console.error('Error guardando el template:', error);
    toast.error('Error al guardar el template.');
  } finally {
    savingTemplate.value = false;
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
    showCreatePair.value = false;
    resetForm();
  }
};

const cancelForm = () => {
  showCreateForm.value = false;
  showEditModal.value = false;
  setTimeout(() => {
    resetForm();
  }, 300);
};

const resetForm = () => {
  templateForm.value = {
    id: null, name: '', description: '', subject: '', senderEmail: '',
    content: '', campaignId: campaignStore.selectedCampaignId || '',
    templateType: 'massive_email', activeVersionId: null
  };
  templateVersions.value = [];
  selectedVersionId.value = null;
  showValidationError.value = false;
};

// Cargar campañas disponibles
const loadAvailableCampaigns = async () => {
  try {
    const response = await $fetch('/api/campaign');
    availableCampaigns.value = response.data || [];
  } catch (error) {
    console.error('Error loading campaigns:', error);
    availableCampaigns.value = [];
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

const onTemplateTypeChange = () => {
  if (templateForm.value.templateType === 'landing') {
    templateForm.value.content = '';
    landingForm.value = { title: '', description: '', imageUrl: '' };
  } else {
    landingForm.value = { title: '', description: '', imageUrl: '' };
  }
};

const onImageError = (event) => {
  console.error('Error al cargar la imagen:', landingForm.value.imageUrl || pairForm.value.landing_image_url);
  event.target.style.display = 'none';
};

const toggleCreatePair = () => {
  showCreatePair.value = !showCreatePair.value;
  if (showCreatePair.value) {
    showCreateForm.value = false;
    showEditModal.value = false;
    resetPairForm();
  }
};

const resetPairForm = () => {
  pairForm.value = {
    template_name: '', description: '', sender_email: '', subject_template: '',
    email_content: '', landing_title: '', landing_description: '', landing_image_url: ''
  };
  editingPair.value = null;
};

const cancelPairForm = () => {
  showCreatePair.value = false;
  setTimeout(() => {
    resetPairForm();
  }, 300);
};

const deleteTemplate = (template) => {
  templateToDelete.value = template;
  showDeleteModal.value = true;
};

const confirmDeleteTemplate = async () => {
  if (!templateToDelete.value) return;

  const template = templateToDelete.value;
  const templateInfo = template.is_pair ? 'par de templates' : 'template';

  // Determinar el ID para el estado de loading (pair_id para pares, id para individuales)
  const loadingId = template.pair_id || template.id;
  deletingTemplateId.value = loadingId;
  isDeletingTemplate.value = true;

  // Toast de información que se está eliminando
  toast.info(`Eliminando ${templateInfo}...`);

  try {
    // Si es un par, necesitamos eliminar usando el pair_id  
    if (template.is_pair) {
      // Para pares usamos el endpoint específico de pares
      await $fetch(`/api/templates/pairs/${template.pair_id}`, {
        method: 'DELETE'
      });
    } else {
      // Para templates individuales
      await deleteTemplateAPI(template.id);
    }
    
    toast.success(`${templateInfo.charAt(0).toUpperCase() + templateInfo.slice(1)} eliminado exitosamente`);
    await loadTemplateList();
  } catch (error) {
    console.error('Error al eliminar template:', error);
    toast.error(`Error al eliminar el ${templateInfo}`);
  } finally {
    deletingTemplateId.value = null;
    isDeletingTemplate.value = false;
    showDeleteModal.value = false;
    templateToDelete.value = null;
  }
};

const cancelDeleteTemplate = () => {
  showDeleteModal.value = false;
  templateToDelete.value = null;
};
</script>