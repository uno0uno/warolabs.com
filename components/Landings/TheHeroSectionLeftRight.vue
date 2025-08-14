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
    
    <div class="flex flex-col h-full">
      <div class="">
        <h1 class="text-4xl font-bold mb-4">{{ title }}</h1>
        <p class="text-lg text-gray-600 mb-6">{{ description }}</p>
      </div>
        <LandingsTheLeadForm :campaignId="campaignId"/>
    </div>
  </div>
</template>