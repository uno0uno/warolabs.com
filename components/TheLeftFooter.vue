<script setup>
const msgsocial = ref('Nuestras redes');
const descriptionWaro = ref(
  'Waro Colombia conecta a comerciantes, artistas y creadores de Colombia para recibir pagos en USDC a través de blockchain.'
);

function openSocialLink(value) {
  window.open(value);
}
</script>

<template>
  <div class="flex flex-col gap-3 items-start">
    <img src="/logos/warocol.logo.svg" alt="Logo-warocolombia" class="w-28 md:w-36" />
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
