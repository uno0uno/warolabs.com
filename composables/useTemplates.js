import { ref, readonly } from 'vue';

export const useTemplates = () => {
  const templates = ref([]);
  const loading = ref(false); 
  const error = ref(null);
  const activeTemplate = ref(null);
  const loadingDetail = ref(false); 
  const templateVersions = ref([]);

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
    } catch (err) {
      console.error(`Error loading template with ID ${templateId}:`, err);
    } finally {
      loadingDetail.value = false;
    }
  };
  
  const refresh = () => loadTemplateList();
  const createTemplate = async (templateData) => {
    const response = await $fetch('/api/templates', {
      method: 'POST',
      body: templateData
    });
    
    await refresh();
    return response.data;
  };

  const updateTemplate = async (templateId, templateData) => {
    const response = await $fetch(`/api/templates/${templateId}`, {
      method: 'PUT',
      body: templateData
    });
    
    await refresh(); 
    return response.data;
  };

  return {
    templates: readonly(templates),
    loading: readonly(loading),
    error: readonly(error),
    activeTemplate: readonly(activeTemplate),
    loadingDetail: readonly(loadingDetail),
    templateVersions: readonly(templateVersions),
    loadTemplateList,
    loadTemplateById,
    refresh,
    createTemplate,
    updateTemplate
  };
};