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
    <div class="aspect-w-16 aspect-h-5">
        <img 
            class="object-contain w-24 h-full sm:w-40 "
            :src="`https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/waro_labs_logo.png`" 
            :alt="'Logo'"  
        />
    </div>
</template>