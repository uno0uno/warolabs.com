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
  <div class="aspect-[16/10] w-full max-w-[6rem] md:max-w-[180px]">
    <img
      class="object-contain w-full h-full"
      src="https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/waro_labs_logo.png"
      alt="Logo"
    />
  </div>
</template>