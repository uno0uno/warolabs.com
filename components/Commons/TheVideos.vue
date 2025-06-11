<script setup>
import { ref, onMounted } from 'vue';

defineProps({
    src: {
        type: String,
        required: true
    },
    alt: {
        type: String,
        default: 'Video'
    },
    width: {
        type: [String, Number]
    },
    height: {
        type: [String, Number]
    },
    className: {
        type: String,
        default: ''
    },
    borderColor: {
        type: String,
        default: 'border-transparent'
    },
    autoplay: {
        type: Boolean,
        default: true
    },
    muted: {
        type: Boolean,
        default: true
    },
    loop: {
        type: Boolean,
        default: true
    }
});

const videoRef = ref(null);

onMounted(() => {
    if (videoRef.value) {
        videoRef.value.muted = true;
        videoRef.value.autoplay = true;
        videoRef.value.loop = true;
        videoRef.value.play();
    }
});
</script>

<template>
    <div>
        <video
            ref="videoRef"
            :src="src"
            :alt="alt"
            :width="width"
            :height="height"
            :class="`object-cover border-2 ${width ? 'w-' + width : ''} ${height ? 'h-' + height : ''} ${borderColor ? borderColor : ''} ${className}`"
            :autoplay="autoplay"
            :muted="muted"
            :loop="loop"
            playsinline
        />
    </div>
</template>