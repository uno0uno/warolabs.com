<!-- // components/Landings/TheHeroSectionLeftRight.vue -->
<script setup>
import { ref, toRefs } from 'vue';

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


const showFullDescription = ref(false);

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start py-12 px-4">
    <ClientOnly>
      <div class="w-full flex border-2 border-slate-900 overflow-hidden h-full">
        <div v-if="!mediaSrc" class="w-full h-[36rem] md:h-full flex justify-center items-center">
          <CommonsTheHeroSectionSkeletonMedia :mediaType="mediaType" />
        </div>

        <div v-else>
          <div v-if="mediaType === 'video'">
            <div class="aspect-video w-full overflow-hidden">
              <video class="w-full h-full object-cover" :src="mediaSrc" controls autoplay muted loop></video>
            </div>
          </div>
          <div v-else-if="mediaType === 'image'">
            <img class="w-full" :src="mediaSrc" :alt="title">
          </div>
        </div>
      </div>
    </ClientOnly>

    <div class="flex flex-col h-full w-full">
      <div class="flex flex-col gap-2 items-start px-6 py-2 border-x-2 border-t-2 border-slate-900">
        <h1 class="text-2xl font-bold text-left">{{ title }}</h1>
        
        <div class="text-md text-gray-600 text-left">
          <p v-if="description.length <= 150 || showFullDescription">
            {{ description }}
          </p>
          <p v-else>
            {{ description.substring(0, 150) + '...' }}
          </p>
          
          <button v-if="description.length > 150" @click="showFullDescription = !showFullDescription" class="text-slate-900 hover:text-slate-900 focus:outline-none flex items-center gap-2">
            {{ showFullDescription ? 'Ver menos' : 'Ver mas' }}
            <span v-if="showFullDescription">▲</span>
            <span v-else class="text-xs">▼</span>
          </button>
        </div>
        
      </div>
      <LandingsTheLeadForm :campaignId="campaignId"/>
    </div>
  </div>
</template>
