<script setup>
const msgsocial = ref('Nuestras redes');
const descriptionWaro = ref(
  'waro colombia conecta a viajeros del mundo que visitan Bogotá con las mejores experiencias culturales de nuestra ciudad segun expertos locales'
);

function openSocialLink(value) {
  window.open(value);
}
</script>

<template>
  <div class="flex flex-col gap-3 items-start">
        <div class="w-36 h-auto lg:w-56">
      <img itemprop="image"
              class="w-auto"
              v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/QmbNmX65nwyDt2cYWN9tanXr1Vx6e2V6rcYxfxGntyfogq`, 'alt':`waro colombia logo`}">
    </div>
    <p
      class="
        text-left
        text-normal text-slate-900
        md:w-2/3
        lg:w-2/4
        xl:w-1/2
      "
    >
      {{ descriptionWaro }}
    </p>
  </div>
</template>

<style scoped></style>
