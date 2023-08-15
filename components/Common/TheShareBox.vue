<script setup>

const props = defineProps({ 
    slug: {type: String},
    });

const { slug } = toRefs(props);

const { copyToClipboard } = useClipboard();

const link = ref(`https://warocol.com/${slug.value}`);

const toggle = ref(false);

function open() {
  toggle.value = !toggle.value;
}

function displayText(value) {
  return value.slice(0, 19) + '..';
}

const handleCopy = async () => {
  await copyToClipboard(link.value);
  toggle.value = !toggle.value;
};

</script>
<template>
  
  <button @click="open()"
    class="w-full rounded-lg py-2 border-4 border-dashed border-slate-900 px-4 font-semibold text-slate-900 cursor-pointer">
    <div class="flex items-center justify-center gap-2 ">
      <LogosTheShare class="h-6 w-6 md:h-8 md:w-8 text-slate-900"/>
      <p class="capitalize">compartir</p>
    </div>
  </button>


<!-- Elemento del popup -->
<div  class="fixed inset-1 flex items-center justify-center backdrop-blur-sm backdrop-filter bg-opacity-100" v-bind:class="{ '': toggle, 'hidden': !toggle }">
  <div class="rounded-2xl flex gap-4 flex-col items-center border border-blue-100 bg-white p-4 shadow-lg sm:p-6 lg:p-8 mx-automd:px-16 lg:mx-auto xl:mx-auto 2xl:mx-auto">
    <div class="flex flex-col items-center gap-2">
      <blockquote class="text-3xl sm:text-4xl font-semibold italic text-slate-900 py-2">
        <span class="before:block before:absolute before:-inset-1 before:-skew-y-2 before:bg-slate-900 relative inline-block">
          <span class="relative text-white capitalize">compartir</span>
        </span>
      </blockquote>
      <div class="flex border items-center py-2 px-4 rounded-xl">
          <p class="text-center">
            {{displayText(link)}}
          </p>
      </div>
    </div>

    <div class=" flex gap-4">
      <button
        @click="open()"
        class="inline-block rounded-lg bg-white hover:bg-slate-100 border px-5 py-3 text-center text-sm font-semibold text-slate-900 sm:w-auto"
        href=""
      >
        cancelar
      </button>
      <button 
        @click="handleCopy()"
        class="bg-indigo-500 hover:bg-indigo-300 rounded-lg px-4 py-2 text-white">
        copiar
      </button>
    </div>
  </div>
</div>

</template>