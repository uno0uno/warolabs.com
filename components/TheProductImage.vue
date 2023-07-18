<script setup>

const props = defineProps({ imgHash: {type: String}});

const { imgHash } = toRefs(props);

</script>

<template>
    <div class="md:col-span-6 lg:col-span-5">
        <img itemprop="image"
        class="md:rounded-xl rounded-xl object-cover w-full"
        v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/${props.imgHash}`, 'alt':props.imgHash}">
    </div>
</template>