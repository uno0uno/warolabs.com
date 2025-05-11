<script setup>

defineProps({
    width: {
        type: String,
        default: '180'
    },
    height: {
        type: String,
        default: '45'
    }
});


</script>

<template>
    <div>
        <img :src="`https://dummyimage.com/${width}x${height}`" :alt="'Logo'"  />
    </div>
</template>