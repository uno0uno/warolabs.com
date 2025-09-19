<template>
  <div class="dashboard-page">
    <!-- Loading State -->
    <div v-if="loading">
      <CommonsTheLoading />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Header (always visible) -->
      <div v-if="!showCreateForm" class="page-header">
        <div>
          <h2 class="page-title">Grupos de Leads</h2>
          <p class="page-description">Segmenta y gestiona tus leads basándote en métricas de engagement</p>
        </div>
        <div class="flex gap-2">
          <NuxtLink
            to="/marketing/analytics"
            class="btn-secondary"
          >
            <ChartBarIcon class="w-5 h-5" />
            Ver Métricas
          </NuxtLink>
          <UiButton @click="toggleCreateForm" class="flex items-center gap-2">
            <PlusIcon class="w-4 h-4" />
            Crear Grupo
          </UiButton>
        </div>
      </div>

      <!-- List View -->
      <div v-if="!showCreateForm">

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 section-spacing">
          <StatCard 
            :value="leadGroups.length" 
            label="total grupos" 
            icon="heroicons:user-group" 
          />
          <StatCard 
            :value="totalLeads" 
            label="total leads" 
            icon="heroicons:users" 
          />
          <StatCard 
            :value="`${avgConversionRate}%`" 
            label="tasa conversión promedio" 
            icon="heroicons:chart-bar" 
          />
          <StatCard 
            :value="highlyEngagedCount" 
            label="engagement alto" 
            icon="heroicons:bolt" 
          />
        </div>

        <!-- Lead Groups List -->
        <div class="section-spacing">
          <LeadGroupsTable 
            :lead-groups="leadGroups" 
            :loading="loading"
            @create="toggleCreateForm"
            @delete="confirmDeleteGroup"
          />
        </div>
      </div>

      <!-- Create Group Form (Inline) -->
      <Transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 transform -translate-y-5"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform -translate-y-5"
      >
        <UiCard v-if="showCreateForm" class="border-2 border-primary/20">
          <UiCardHeader>
            <div class="flex items-center gap-3">
              <UiButton variant="ghost" size="sm" @click="cancelForm" class="p-2">
                <ArrowLeftIcon class="w-4 h-4" />
              </UiButton>
              <div class="flex-1">
                <UiCardTitle>
                  Crear Grupo de Leads
                </UiCardTitle>
                <p class="text-sm text-muted-foreground">Paso {{ currentStep }} de {{ totalSteps }}: 
                  <span v-if="currentStep === 1">Información básica</span>
                  <span v-else-if="currentStep === 2">Selecciona criterios de filtrado</span>
                  <span v-else>Configura los filtros</span>
                </p>
              </div>
              <!-- Progress indicator -->
              <div class="flex gap-2">
                <div 
                  v-for="step in totalSteps" 
                  :key="step"
                  class="w-2 h-2 rounded-full"
                  :class="step <= currentStep ? 'bg-primary' : 'bg-muted'"
                ></div>
              </div>
            </div>
          </UiCardHeader>
          <UiCardContent>
            <!-- Step 1: Basic Information -->
            <div v-if="currentStep === 1" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium mb-2">
                    Nombre del Grupo *
                  </label>
                  <UiInput
                    v-model="formData.group_name"
                    placeholder="Ej: Leads Altamente Comprometidos"
                    class="h-10 w-full"
                  ></UiInput>
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium mb-2">
                    Descripción
                  </label>
                  <UiTextarea
                    v-model="formData.group_description"
                    placeholder="Describe el propósito de este grupo..."
                    class="w-full resize-none"
                    rows="2"
                  ></UiTextarea>
                </div>
              </div>

              <!-- Source Selection -->
              <div class="bg-muted/30 p-4">
                <h3 class="text-lg font-semibold mb-4">Origen de Leads</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-muted/50" :class="{ 'bg-primary/10 border-primary': formData.source_type === 'all' }">
                    <input
                      v-model="formData.source_type"
                      type="radio"
                      value="all"
                      class="sr-only"
                    />
                    <div class="flex-1">
                      <p class="font-medium">Todos los Leads</p>
                      <p class="text-sm text-muted-foreground">Crear grupo desde toda la base de datos</p>
                    </div>
                  </label>

                  <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-muted/50" :class="{ 'bg-primary/10 border-primary': formData.source_type === 'existing_group' }">
                    <input
                      v-model="formData.source_type"
                      type="radio"
                      value="existing_group"
                      class="sr-only"
                    />
                    <div class="flex-1">
                      <p class="font-medium">Grupo Existente</p>
                      <p class="text-sm text-muted-foreground">Refinar desde un grupo existente</p>
                    </div>
                  </label>
                </div>

                <!-- Existing Group Selector -->
                <div v-if="formData.source_type === 'existing_group'" class="mt-4">
                  <div>
                    <label class="block text-sm font-medium mb-1">
                      Grupo de Origen
                    </label>
                    <select
                      v-model="formData.source_group_id"
                      class="w-full h-10 p-2 border border-border bg-background"
                    >
                      <option value="">Selecciona un grupo</option>
                      <option v-for="group in leadGroups" :key="group.id" :value="group.id">
                        {{ group.name }} ({{ group.member_count || 0 }} leads)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Criteria Selection -->
            <div v-if="currentStep === 2" class="space-y-6">
              <div class="text-center mb-6">
                <h3 class="text-lg font-semibold mb-2">¿Qué criterios quieres usar para filtrar?</h3>
                <p class="text-sm text-muted-foreground">Selecciona los tipos de filtros que necesitas. Solo se mostrarán en el siguiente paso.</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Filtros por Email -->
                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-muted/50" :class="{ 'bg-primary/10 border-primary': selectedCriteria.email_filters }">
                  <input
                    v-model="selectedCriteria.email_filters"
                    type="checkbox"
                    class="sr-only"
                  />
                  <div class="flex-1">
                    <p class="font-medium">📧 Filtros por Email</p>
                    <p class="text-sm text-muted-foreground">Dominios específicos, tipos de email (personal/corporativo)</p>
                  </div>
                  <div v-if="selectedCriteria.email_filters" class="text-primary">✓</div>
                </label>

                <!-- Interacciones y Engagement -->
                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-muted/50" :class="{ 'bg-primary/10 border-primary': selectedCriteria.interaction_filters }">
                  <input
                    v-model="selectedCriteria.interaction_filters"
                    type="checkbox"
                    class="sr-only"
                  />
                  <div class="flex-1">
                    <p class="font-medium">📊 Interacciones y Engagement</p>
                    <p class="text-sm text-muted-foreground">Aperturas, clicks, tipos de interacción</p>
                  </div>
                  <div v-if="selectedCriteria.interaction_filters" class="text-primary">✓</div>
                </label>

                <!-- Datos UTM -->
                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-muted/50" :class="{ 'bg-primary/10 border-primary': selectedCriteria.utm_filters }">
                  <input
                    v-model="selectedCriteria.utm_filters"
                    type="checkbox"
                    class="sr-only"
                  />
                  <div class="flex-1">
                    <p class="font-medium">🎯 Datos UTM y Campañas</p>
                    <p class="text-sm text-muted-foreground">Fuente, medio, campañas específicas</p>
                  </div>
                  <div v-if="selectedCriteria.utm_filters" class="text-primary">✓</div>
                </label>

                <!-- Estado del Lead -->
                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-muted/50" :class="{ 'bg-primary/10 border-primary': selectedCriteria.lead_status }">
                  <input
                    v-model="selectedCriteria.lead_status"
                    type="checkbox"
                    class="sr-only"
                  />
                  <div class="flex-1">
                    <p class="font-medium">✅ Estado del Lead</p>
                    <p class="text-sm text-muted-foreground">Verificados, convertidos</p>
                  </div>
                  <div v-if="selectedCriteria.lead_status" class="text-primary">✓</div>
                </label>

                <!-- Actividad Reciente -->
                <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-muted/50 md:col-span-2" :class="{ 'bg-primary/10 border-primary': selectedCriteria.recent_activity }">
                  <input
                    v-model="selectedCriteria.recent_activity"
                    type="checkbox"
                    class="sr-only"
                  />
                  <div class="flex-1">
                    <p class="font-medium">⏰ Actividad Reciente</p>
                    <p class="text-sm text-muted-foreground">Filtrar por actividad en los últimos días</p>
                  </div>
                  <div v-if="selectedCriteria.recent_activity" class="text-primary">✓</div>
                </label>
              </div>
            </div>

            <!-- Step 3: Configure Selected Filters -->
            <div v-if="currentStep === 3" class="space-y-6">
              <div class="text-center mb-6">
                <h3 class="text-lg font-semibold mb-2">Configurar Filtros Seleccionados</h3>
                <p class="text-sm text-muted-foreground">Configura los criterios que seleccionaste en el paso anterior</p>
              </div>

              <!-- Filtros por Email -->
              <div v-if="selectedCriteria.email_filters" class="bg-muted/30 p-6">
                <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                  📧 Buscar Emails Específicos
                </h4>
                
                <div>
                  <label class="block text-sm font-medium mb-2">Buscar emails en la base de datos</label>
                  <div class="relative">
                    <UiInput
                      v-model="emailSearchQuery"
                      @input="searchEmails"
                      placeholder="Escribe para buscar emails..."
                      class="h-10"
                    />
                    <div v-if="emailSearchLoading" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div class="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  </div>

                  <!-- Resultados de búsqueda de emails -->
                  <div v-if="emailSearchResults.length > 0" class="mt-3 max-h-64 overflow-y-auto border border-border bg-background rounded">
                    <div class="p-3 bg-muted/50 text-sm font-medium border-b sticky top-0">
                      {{ emailSearchResults.length }} emails encontrados
                    </div>
                    <label 
                      v-for="email in emailSearchResults" 
                      :key="email.email"
                      class="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        :checked="formData.filters.specific_emails.includes(email.email)"
                        @change="toggleSpecificEmail(email.email)"
                        class="rounded"
                      />
                      <div class="flex-1">
                        <div class="font-medium text-sm">{{ email.email }}</div>
                        <div v-if="email.name" class="text-xs text-muted-foreground">
                          {{ email.name }}
                        </div>
                        <div class="text-xs text-muted-foreground">
                          {{ email.interaction_count || 0 }} interacciones
                        </div>
                      </div>
                    </label>
                  </div>

                  <!-- Emails seleccionados -->
                  <div v-if="formData.filters.specific_emails.length > 0" class="mt-4">
                    <div class="text-sm font-medium mb-3">Emails seleccionados ({{ formData.filters.specific_emails.length }}):</div>
                    <div class="flex flex-wrap gap-2">
                      <span 
                        v-for="email in formData.filters.specific_emails" 
                        :key="email"
                        class="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                      >
                        {{ email }}
                        <button 
                          @click="removeSpecificEmail(email)" 
                          class="hover:text-destructive transition-colors"
                          title="Remover email"
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  </div>

                  <!-- Mensaje si no hay resultados -->
                  <div v-if="emailSearchQuery && emailSearchResults.length === 0 && !emailSearchLoading" class="mt-3 p-4 text-sm text-muted-foreground bg-muted/30 rounded text-center">
                    No se encontraron emails que coincidan con "{{ emailSearchQuery }}"
                  </div>

                  <!-- Mensaje de ayuda -->
                  <div v-if="!emailSearchQuery" class="mt-3 p-4 text-sm text-muted-foreground bg-blue-50 rounded">
                    💡 Escribe al menos 3 caracteres para buscar emails en tu base de datos
                  </div>
                </div>
              </div>

              <!-- Filtros de Interacciones -->
              <div v-if="selectedCriteria.interaction_filters" class="bg-muted/30 p-6">
                <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                  📊 Interacciones y Engagement
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Mínimo de interacciones</label>
                    <UiInput
                      v-model.number="formData.filters.min_interactions"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="h-10"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Mínimo de aperturas</label>
                    <UiInput
                      v-model.number="formData.filters.min_opens"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="h-10"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Mínimo de clicks</label>
                    <UiInput
                      v-model.number="formData.filters.min_clicks"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="h-10"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Tipo de interacción requerida</label>
                    <select v-model="formData.filters.has_interaction_type" class="w-full h-10 p-2 border border-border bg-background">
                      <option value="">Cualquier tipo</option>
                      <option v-for="type in availableInteractionTypes" :key="type" :value="type">
                        {{ type }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Tipo de interacción a excluir</label>
                    <select v-model="formData.filters.exclude_interaction_type" class="w-full h-10 p-2 border border-border bg-background">
                      <option value="">No excluir ninguno</option>
                      <option v-for="type in availableInteractionTypes" :key="type" :value="type">
                        {{ type }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Filtros UTM y Campañas -->
              <div v-if="selectedCriteria.utm_filters" class="bg-muted/30 p-6">
                <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                  🎯 Datos UTM y Campañas
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">UTM Source</label>
                    <UiInput
                      v-model="formData.filters.source"
                      placeholder="Ej: google, facebook"
                      class="h-10"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">UTM Medium</label>
                    <UiInput
                      v-model="formData.filters.medium"
                      placeholder="Ej: email, social"
                      class="h-10"
                    />
                  </div>
                </div>

                <!-- Selector de Campañas -->
                <div class="mt-4">
                  <label class="block text-sm font-medium mb-2">Campañas específicas</label>
                  
                  <!-- Buscador de campañas -->
                  <div class="relative mb-3">
                    <UiInput
                      v-model="campaignSearchQuery"
                      placeholder="Buscar campañas..."
                      class="h-10"
                    />
                  </div>

                  <!-- Lista de campañas con checkbox -->
                  <div class="max-h-48 overflow-y-auto border border-border bg-background p-2">
                    <!-- Opción "Todas las campañas" -->
                    <label class="flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer">
                      <input
                        type="checkbox"
                        :checked="formData.filters.campaigns.length === 0"
                        @change="toggleAllCampaigns"
                        class="rounded"
                      />
                      <span class="font-medium">Todas las campañas</span>
                    </label>
                    
                    <hr class="my-2">
                    
                    <!-- Campañas individuales -->
                    <div v-if="filteredCampaigns.length === 0 && campaignSearchQuery" class="p-2 text-sm text-muted-foreground">
                      No se encontraron campañas
                    </div>
                    
                    <label 
                      v-for="campaign in filteredCampaigns" 
                      :key="campaign.slug"
                      class="flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        :checked="formData.filters.campaigns.includes(campaign.slug)"
                        @change="toggleCampaign(campaign.slug)"
                        class="rounded"
                      />
                      <div class="flex-1">
                        <span class="text-sm">{{ campaign.name }}</span>
                        <div class="text-xs text-muted-foreground">{{ campaign.slug }}</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Estado del Lead -->
              <div v-if="selectedCriteria.lead_status" class="bg-muted/30 p-6">
                <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                  ✅ Estado del Lead
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label class="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-muted/50" :class="{ 'bg-primary/10 border-primary': formData.filters.is_verified }">
                    <input
                      v-model="formData.filters.is_verified"
                      type="checkbox"
                      class="sr-only"
                    />
                    <div class="flex-1">
                      <p class="font-medium">Solo leads verificados</p>
                      <p class="text-sm text-muted-foreground">Incluir únicamente leads que han verificado su email</p>
                    </div>
                    <div v-if="formData.filters.is_verified" class="text-primary">✓</div>
                  </label>

                  <label class="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-muted/50" :class="{ 'bg-primary/10 border-primary': formData.filters.is_converted }">
                    <input
                      v-model="formData.filters.is_converted"
                      type="checkbox"
                      class="sr-only"
                    />
                    <div class="flex-1">
                      <p class="font-medium">Solo leads convertidos</p>
                      <p class="text-sm text-muted-foreground">Incluir únicamente leads que han completado una conversión</p>
                    </div>
                    <div v-if="formData.filters.is_converted" class="text-primary">✓</div>
                  </label>
                </div>
              </div>

              <!-- Actividad Reciente -->
              <div v-if="selectedCriteria.recent_activity" class="bg-muted/30 p-6">
                <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                  ⏰ Actividad Reciente
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Actividad en los últimos días</label>
                    <UiInput
                      v-model.number="formData.filters.recent_interaction_days"
                      type="number"
                      min="1"
                      placeholder="Ej: 30"
                      class="h-10"
                    />
                    <p class="text-xs text-muted-foreground mt-1">Dejar vacío para incluir toda la actividad</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Mínimo total de interacciones</label>
                    <UiInput
                      v-model.number="formData.filters.min_total_interactions"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="h-10"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium mb-2">Máximo total de interacciones</label>
                    <UiInput
                      v-model.number="formData.filters.max_total_interactions"
                      type="number"
                      min="0"
                      placeholder="Sin límite"
                      class="h-10"
                    />
                  </div>
                </div>
              </div>

              <!-- Mensaje si no hay criterios seleccionados -->
              <div v-if="!Object.values(selectedCriteria).some(Boolean)" class="text-center py-8">
                <p class="text-muted-foreground">No has seleccionado ningún criterio de filtrado.</p>
                <UiButton variant="outline" @click="previousStep" class="mt-3">
                  ← Volver al paso anterior
                </UiButton>
              </div>
            </div>
            
            
            <!-- Actions -->
            <div class="flex justify-between gap-3 pt-6 border-t">
              <div>
                <UiButton v-if="currentStep > 1" variant="outline" @click="previousStep">
                  ← Anterior
                </UiButton>
              </div>
              
              <div class="flex gap-3">
                <UiButton variant="outline" @click="cancelForm">
                  Cancelar
                </UiButton>
                
                <UiButton v-if="currentStep < totalSteps" @click="nextStep" :disabled="!formData.group_name && currentStep === 1">
                  Siguiente →
                </UiButton>
                
                <UiButton v-if="currentStep === totalSteps" @click="createGroup" :disabled="!formData.group_name || isCreating" class="bg-primary text-primary-foreground">
                  <div v-if="isCreating" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Crear Grupo
                </UiButton>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
      </Transition>


    </div>

  <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <Transition
          enter-active-class="transition-all duration-300 ease-out delay-100"
          enter-from-class="opacity-0 transform scale-95 -translate-y-4"
          enter-to-class="opacity-100 transform scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 transform scale-100 translate-y-0"
          leave-to-class="opacity-0 transform scale-95 -translate-y-4"
        >
          <UiCard v-if="showDeleteModal" class="w-full max-w-md border-2 border-destructive/20">
            <UiCardHeader>
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-full bg-destructive/10">
                  <ExclamationTriangleIcon class="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <UiCardTitle class="text-destructive">Eliminar Grupo</UiCardTitle>
                  <p class="text-sm text-muted-foreground mt-1">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </UiCardHeader>

            <UiCardContent>
              <div class="space-y-4">
                <div v-if="groupToDelete" class="p-4 bg-muted/30">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium">{{ groupToDelete.name }}</p>
                      <p class="text-sm text-muted-foreground">{{ groupToDelete.member_count || 0 }} miembros</p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs text-muted-foreground">Creado</p>
                      <p class="text-sm font-medium">{{ new Date(groupToDelete.created_at).toLocaleDateString() }}</p>
                    </div>
                  </div>
                </div>
                
                <p class="text-sm text-muted-foreground">
                  ¿Estás seguro de que quieres eliminar este grupo de leads? 
                  Se perderán todos los datos de segmentación asociados.
                </p>
              </div>
            </UiCardContent>

            <UiCardFooter class="flex gap-2 justify-end">
              <UiButton variant="outline" @click="cancelDelete" :disabled="isDeleting">
                Cancelar
              </UiButton>
              <UiButton variant="destructive" @click="deleteLeadGroup" :disabled="isDeleting">
                <div v-if="isDeleting" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                {{ isDeleting ? 'Eliminando...' : 'Eliminar Grupo' }}
              </UiButton>
            </UiCardFooter>
          </UiCard>
        </Transition>
      </div>
    </Transition> 
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { 
  ChartBarIcon, 
  PlusIcon, 
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { useLeadGroups } from '~/composables/useLeadGroups'
import { useToast } from '@/composables/useToast'
import LeadGroupsTable from '@/components/LeadGroupsTable.vue'
import StatCard from '@/components/Commons/StatCard.vue'

const { 
  loading, 
  leadGroups, 
  fetchLeadGroups,
  fetchLeadMetrics,
  createLeadGroup,
  getAvailableInteractionTypes
} = useLeadGroups()

const toast = useToast()

const showCreateForm = ref(false)
const showDeleteModal = ref(false)
const groupToDelete = ref(null)
const isDeleting = ref(false)
const isCreating = ref(false)

// Wizard steps
const currentStep = ref(1)
const totalSteps = ref(3)

// Criterios seleccionados para mostrar
const selectedCriteria = reactive({
  email_filters: false,
  interaction_filters: false,
  utm_filters: false,
  lead_status: false,
  recent_activity: false
})
const availableCampaigns = ref([])
const availableInteractionTypes = ref(getAvailableInteractionTypes())
const campaignSearchQuery = ref('')

// Email search variables
const emailSearchQuery = ref('')
const emailSearchResults = ref([])
const emailSearchLoading = ref(false)
let emailSearchTimeout = null


const formData = reactive({
  group_name: '',
  group_description: '',
  source_type: 'all', // 'all' or 'existing_group'
  source_group_id: '',
  filters: {
    min_interactions: 0,
    min_opens: 0,
    min_clicks: 0,
    source: '',
    medium: '',
    campaigns: [],
    is_verified: false,
    is_converted: false,
    has_interaction_type: '',
    exclude_interaction_type: '',
    only_interaction_type: '',
    recent_interaction_days: undefined,
    min_total_interactions: undefined,
    max_total_interactions: undefined,
    // Filtros por email
    specific_emails: [] // Array de emails específicos seleccionados
  }
})

// Computed properties
const totalLeads = computed(() => {
  return leadGroups.value.reduce((sum, group) => sum + (group.member_count || 0), 0)
})

const avgConversionRate = computed(() => {
  if (leadGroups.value.length === 0) return 0
  const sum = leadGroups.value.reduce((acc, group) => acc + (group.conversion_rate || 0), 0)
  return Math.round(sum / leadGroups.value.length)
})

const highlyEngagedCount = computed(() => {
  return leadGroups.value.reduce((sum, group) => {
    return sum + (group.activity_stats?.total_clicks || 0)
  }, 0)
})

// Filtrado de campañas para búsqueda
const filteredCampaigns = computed(() => {
  if (!campaignSearchQuery.value) {
    return availableCampaigns.value
  }
  
  const query = campaignSearchQuery.value.toLowerCase()
  return availableCampaigns.value.filter(campaign => 
    campaign.name.toLowerCase().includes(query) ||
    campaign.slug.toLowerCase().includes(query)
  )
})

// Methods
const onGroupCreated = async () => {
  await fetchLeadGroups()
}





// Form management functions
const toggleCreateForm = () => {
  showCreateForm.value = !showCreateForm.value
  if (showCreateForm.value) {
    resetForm()
    resetWizard()
    loadCampaigns()
  }
}

const cancelForm = () => {
  showCreateForm.value = false
  setTimeout(() => {
    resetForm()
  }, 300)
}

// Wizard navigation
const nextStep = () => {
  if (currentStep.value < totalSteps.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const resetWizard = () => {
  currentStep.value = 1
  selectedCriteria.email_filters = false
  selectedCriteria.interaction_filters = false
  selectedCriteria.utm_filters = false
  selectedCriteria.lead_status = false
  selectedCriteria.recent_activity = false
}

const resetForm = () => {
  formData.group_name = ''
  formData.group_description = ''
  formData.source_type = 'all'
  formData.source_group_id = ''
  formData.filters = {
    min_interactions: 0,
    min_opens: 0,
    min_clicks: 0,
    source: '',
    medium: '',
    campaigns: [],
    is_verified: false,
    is_converted: false,
    has_interaction_type: '',
    exclude_interaction_type: '',
    only_interaction_type: '',
    recent_interaction_days: undefined,
    min_total_interactions: undefined,
    max_total_interactions: undefined,
    // Filtros por email
    specific_emails: []
  }
  resetWizard()
}

const loadCampaigns = async () => {
  try {
    const response = await $fetch('/api/campaign')
    availableCampaigns.value = response.data || []
  } catch (error) {
    console.error('Error loading campaigns:', error)
  }
}

const toggleAllCampaigns = () => {
  if (formData.filters.campaigns.length === 0) {
    // Currently showing "all campaigns", so we don't change anything
    // Keep it empty to mean "all campaigns"
    formData.filters.campaigns = []
  } else {
    // Currently has specific campaigns selected, so clear to show "all campaigns"
    formData.filters.campaigns = []
  }
}

const toggleCampaign = (campaignSlug) => {
  const index = formData.filters.campaigns.indexOf(campaignSlug)
  if (index > -1) {
    // Remove campaign from selection
    formData.filters.campaigns.splice(index, 1)
    // If no campaigns are selected, it means "all campaigns" 
    // The checkbox will auto-update via reactive :checked
  } else {
    // Add campaign to selection
    formData.filters.campaigns.push(campaignSlug)
    // Now we have specific campaigns selected, so "all campaigns" will be unchecked
  }
}


// Email search functions
const searchEmails = () => {
  // Clear previous timeout
  if (emailSearchTimeout) {
    clearTimeout(emailSearchTimeout)
  }

  // Don't search if query is too short
  if (emailSearchQuery.value.length < 3) {
    emailSearchResults.value = []
    return
  }

  // Debounce search
  emailSearchTimeout = setTimeout(async () => {
    emailSearchLoading.value = true
    try {
      const response = await $fetch('/api/leads/search-emails', {
        method: 'POST',
        body: {
          query: emailSearchQuery.value,
          limit: 50
        }
      })
      emailSearchResults.value = response.data || []
    } catch (error) {
      console.error('Error searching emails:', error)
      emailSearchResults.value = []
    } finally {
      emailSearchLoading.value = false
    }
  }, 300)
}

const toggleSpecificEmail = (email) => {
  const index = formData.filters.specific_emails.indexOf(email)
  if (index > -1) {
    // Remove email from selection
    formData.filters.specific_emails.splice(index, 1)
  } else {
    // Add email to selection
    formData.filters.specific_emails.push(email)
  }
}

const removeSpecificEmail = (email) => {
  const index = formData.filters.specific_emails.indexOf(email)
  if (index > -1) {
    formData.filters.specific_emails.splice(index, 1)
  }
}


const createGroup = async () => {
  if (!formData.group_name) {
    toast.error('El nombre del grupo es requerido')
    return
  }

  // Validar selección de grupo origen si es necesario
  if (formData.source_type === 'existing_group' && !formData.source_group_id) {
    toast.error('Selecciona un grupo de origen')
    return
  }

  isCreating.value = true
  try {
    // Limpiar filtros vacíos antes de enviar
    const cleanedFormData = {
      group_name: formData.group_name,
      group_description: formData.group_description,
      source_type: formData.source_type,
      source_group_id: formData.source_group_id,
      filters: {}
    }

    // Solo agregar filtros que tienen valores (solo se aplican si source_type === 'all')
    if (formData.source_type === 'all') {
      if (formData.filters.min_interactions > 0) cleanedFormData.filters.min_interactions = formData.filters.min_interactions
      if (formData.filters.min_opens > 0) cleanedFormData.filters.min_opens = formData.filters.min_opens
      if (formData.filters.min_clicks > 0) cleanedFormData.filters.min_clicks = formData.filters.min_clicks
      if (formData.filters.source) cleanedFormData.filters.source = formData.filters.source
      if (formData.filters.medium) cleanedFormData.filters.medium = formData.filters.medium
      if (formData.filters.campaigns && formData.filters.campaigns.length > 0) cleanedFormData.filters.campaigns = formData.filters.campaigns
      
      // Filtros de email específicos
      if (formData.filters.specific_emails && formData.filters.specific_emails.length > 0) cleanedFormData.filters.specific_emails = formData.filters.specific_emails
      
      // Solo enviar checkboxes si están marcados
      if (formData.filters.is_verified) cleanedFormData.filters.is_verified = true
      if (formData.filters.is_converted) cleanedFormData.filters.is_converted = true
    }

    await createLeadGroup(cleanedFormData)
    toast.success('Grupo creado exitosamente')
    await fetchLeadGroups()
    showCreateForm.value = false
    resetForm()
  } catch (error) {
    toast.error('Error al crear el grupo')
  } finally {
    isCreating.value = false
  }
}

const confirmDeleteGroup = (group) => {
  groupToDelete.value = group
  showDeleteModal.value = true
}

const deleteLeadGroup = async () => {
  if (!groupToDelete.value) return
  
  isDeleting.value = true
  
  try {
    const response = await $fetch(`/api/lead-groups/${groupToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      toast.success(`Grupo "${groupToDelete.value.name}" eliminado exitosamente`)
      await fetchLeadGroups() // Recargar la lista
      showDeleteModal.value = false
      groupToDelete.value = null
    }
  } catch (error) {
    console.error('Error al eliminar grupo:', error)
    toast.error('Error al eliminar el grupo. Inténtalo de nuevo.')
  } finally {
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  groupToDelete.value = null
}

// Load data on mount

onMounted(() => {
  fetchLeadGroups()
})
</script>