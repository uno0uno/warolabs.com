<script setup>

const toggle = ref(false);

function open() {
  toggle.value = !toggle.value;
  console.log(toggle.value);
}

</script>
<template>

  <button @click="open()"
    class="w-full rounded-lg py-3 px-4 bg-slate-100 font-semibold text-slate-900 hover:bg-slate-200 cursor-pointer border-2">
    <div class="flex items-center justify-center gap-2 ">
      <LogosTheShare class="h-6 w-6 md:h-8 md:w-8 text-slate-900"/>
      <p class="capitalize">compartir</p>
    </div>
  </button>

<div v-bind:class="{ 'bg-red-200': toggle, 'bg-blue-200': !toggle }">
hola
</div>

<!-- Elemento del popup -->
<div  class="fixed inset-0 flex items-center justify-center rouded-lg backdrop-blur-sm backdrop-filter bg-opacity-75 hidden">
  <div class="bg-white p-8 rounded shadow-lg">
    <!-- Contenido del popup -->
    <p>Este es el contenido del popup.</p>
    <!-- Botón para cerrar el popup -->
    <button @click="open()" class="mt-4 bg-red-500 text-white py-2 px-4 rounded">Cerrar</button>
  </div>
</div>

</template>