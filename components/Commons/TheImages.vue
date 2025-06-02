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
    },
    borderColor: {
        type: String,
        default: 'bg-transparent'
    }
});
</script>

<template>
    <div>
        <img 
            :src="src" 
            :alt="alt" 
            :width="width" 
            :height="height" 
            :loading="lazy ? 'lazy' : 'eager'" 
            :class="`object-cover border-2 ${width ? 'w-' + width : ''} ${height ? 'h-' + height : ''} ${borderColor ? borderColor : ''}`" 
        />
    </div>
</template>