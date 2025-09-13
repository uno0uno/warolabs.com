import { ref, readonly } from 'vue';

export const useTemplates = () => {
  // --- Estado para Plantillas Individuales (Existente) ---
  const templates = ref([]);
  const activeTemplate = ref(null);
  const templateVersions = ref([]);
  const loadingDetail = ref(false); 

  // --- Nuevo Estado para Pares de Plantillas ---
  const templatePairs = ref([]);

  // --- Estado General ---
  const loading = ref(false); 
  const error = ref(null);

  // --- Funciones para Plantillas Individuales (Existente) ---
  const loadTemplateList = async () => {
    try {
      loading.value = true;
      const response = await $fetch('/api/templates');
      templates.value = response?.data || [];
    } catch (err) {
      console.error('Error loading templates:', err);
      error.value = err;
      templates.value = [];
    } finally {
      loading.value = false;
    }
  };

  const loadTemplateById = async (templateId) => {
    if (!templateId) return null;
    
    try {
      loadingDetail.value = true;
      activeTemplate.value = null;
      const response = await $fetch(`/api/templates/${templateId}`);
      
      const detailedTemplate = response?.data || null;
      activeTemplate.value = detailedTemplate;
      if (detailedTemplate && detailedTemplate.versions) {
        templateVersions.value = detailedTemplate.versions;
      } else {
        templateVersions.value = [];
      }

      return detailedTemplate;
    } catch (err)      {
      console.error(`Error loading template with ID ${templateId}:`, err);
    } finally {
      loadingDetail.value = false;
    }
  };
  
  const createTemplate = async (templateData) => {
    const response = await $fetch('/api/templates', {
      method: 'POST',
      body: templateData
    });
    
    await loadTemplateList();
    return response.data;
  };

  const updateTemplate = async (templateId, templateData) => {
    const response = await $fetch(`/api/templates/${templateId}`, {
      method: 'PUT',
      body: templateData
    });
    
    await loadTemplateList(); 
    return response.data;
  };

  const deleteTemplate = async (templateId) => {
    const response = await $fetch(`/api/templates/${templateId}`, {
      method: 'DELETE'
    });
    
    await loadTemplateList();
    return response.data;
  };

  // --- Nuevas Funciones para Pares de Plantillas ---
  
  /**
   * Carga la lista de todos los pares de plantillas disponibles.
   */
  const loadTemplatePairs = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch('/api/templates/pairs');
      if (response.success) {
        templatePairs.value = response.data;
      }
    } catch (err) {
      console.error('Error loading template pairs:', err);
      error.value = 'No se pudieron cargar los pares de plantillas.';
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crea un nuevo par de plantillas (email y landing).
   * @param {object} pairData - Datos para el nuevo par de plantillas.
   */
  const createTemplatePair = async (pairData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch('/api/templates/create-pair', {
        method: 'POST',
        body: pairData,
      });
      await loadTemplatePairs(); // Recarga la lista de pares
      return response;
    } catch (err) {
      error.value = 'Error al crear el par de plantillas.';
      console.error(err);
      throw err; // Lanza el error para que el componente lo maneje
    } finally {
      loading.value = false;
    }
  };

  /**
   * Actualiza un par de plantillas existente.
   * @param {string} pairId - El ID de la campaña o par a actualizar.
   * @param {object} pairData - Nuevos datos para las plantillas.
   */
  const updateTemplatePair = async (pairId, pairData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch(`/api/templates/pairs/${pairId}`, {
        method: 'PUT',
        body: pairData,
      });
      await loadTemplatePairs(); // Recarga la lista de pares
      return response;
    } catch (err) {
      error.value = 'Error al actualizar el par de plantillas.';
      console.error(err);
      throw err; // Lanza el error para que el componente lo maneje
    } finally {
      loading.value = false;
    }
  };
  
  // La función refresh ahora puede decidir qué recargar, o simplemente recargar todo.
  // Por simplicidad, se mantiene como estaba, pero podrías extenderla.
  const refresh = () => loadTemplateList();

  return {
    // --- Propiedades y funciones existentes ---
    templates: readonly(templates),
    activeTemplate: readonly(activeTemplate),
    loadingDetail: readonly(loadingDetail),
    templateVersions: readonly(templateVersions),
    loadTemplateList,
    loadTemplateById,
    refresh,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    
    // --- Nuevas propiedades y funciones ---
    templatePairs: readonly(templatePairs),
    loadTemplatePairs,
    createTemplatePair,
    updateTemplatePair,

    // --- Propiedades de estado compartidas ---
    loading: readonly(loading),
    error: readonly(error),
  };
};