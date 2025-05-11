<script setup>
defineProps({
    src: {
        type: String,
        required: true
    },
    alt: {
        type: String,
        default: 'Image'
    },
    width: {
        type: [String, Number]
    },
    height: {
        type: [String, Number]
    },
    lazy: {
        type: Boolean,
        default: false
    },
    className: {
        type: String,
        default: ''
    }
});
</script>

<template>
    <div :class="`relative ${className}`">
        <img 
            :src="src" 
            :alt="alt" 
            :width="width" 
            :height="height" 
            :loading="lazy ? 'lazy' : 'eager'" 
            :class="`object-cover rounded-lg ${width ? 'w-' + width : ''} ${height ? 'h-' + height : ''}`" 
        />
    </div>
</template>