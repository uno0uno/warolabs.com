<!-- components/Landings/TheHeroSectionLeftRight.vue -->

<script setup>

const props = defineProps({
    mediaType: {
        type: String,
        required: true,
        validator: (value) => ['image', 'video'].includes(value),
    },
    mediaSrc: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    campaignId: {
        type: String,
        required: true
    }
    
});

const { mediaType, mediaSrc, title, description, campaignId } = toRefs(props);

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start py-12 px-4">
    <div>
      <div v-if="mediaType === 'video'">
        <div class="aspect-video w-full rounded-lg overflow-hidden">
          <video class="w-full h-full object-cover" :src="mediaSrc" controls autoplay muted loop></video>
        </div>
      </div>
      <div v-else-if="mediaType === 'image'">
        <img class="w-full rounded-lg" :src="mediaSrc" :alt="title">
      </div>
    </div>
    
    <div class="flex flex-col h-full w-full">
      <div class="flex flex-col items-start px-6 py-2 border-x-2 border-t-2 border-slate-900">
        <h1 class="text-4xl font-bold text-left">{{ title }}</h1>
        <p class="text-md text-gray-600 text-left">{{ description }}</p>
      </div>
        <LandingsTheLeadForm :campaignId="campaignId"/>
    </div>
  </div>
</template>