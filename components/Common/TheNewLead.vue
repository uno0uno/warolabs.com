<script setup>

const toggle = ref(false);
const sended = ref(false);
const email = ref('');
const loading = ref(false);

function open() {
  toggle.value = !toggle.value;
}

async function sendLead() {

  loading.value = true;

  const {
  data: response,
  pending,
  refresh,
  execute,
  error,
} = await useAsyncData('send-new-lead', () => {
  try {
    return $fetch(`/api/leadsRegister/newLead`, {
    method: 'POST',
    body: { 
      email: email.value,
      campaign: 1
      }
  });
  } catch (error) {
    return error;
  }
});
if(toRaw(response.value)){
  email.value = '';
  loading.value = false;
  sended.value = true;
}
}


</script>

<template>
  <button
    class="
      inline-flex
      h-12
      w-full
      items-center
      justify-center
      gap-2
      rounded-lg
      border-slate-900 border-4 border-dashed
      px-4
      py-2
      text-base
      font-semibold
      leading-6
      text-slate-900
      sm:w-auto
    "
    @click="open()"
  >
    Empezar gratis
    <LogosTheArrowRight class="h-5 w-5 text-slate-900"/>
  </button>

  <!-- Elemento del popup -->
<div  class="fixed inset-1 flex items-center justify-center backdrop-blur-sm backdrop-filter bg-opacity-100" v-bind:class="{ '': toggle, 'hidden': !toggle }">
  <div class="rounded-2xl flex gap-4 flex-col items-center border-4 border-slate-900 border-dashed bg-white p-4 shadow-lg sm:p-6 lg:p-8 mx-automd:px-16 lg:mx-auto xl:mx-auto 2xl:mx-auto">

    <div v-if="!sended && !loading" class="flex flex-col items-center gap-2">
      <label for="EmailUser">
        <blockquote class="text-3xl sm:text-4xl font-semibold italic text-slate-900 py-2">
          <span class="before:block before:absolute before:-inset-1 before:-skew-y-2 before:bg-slate-900 relative inline-block">
            <span class="relative text-white capitalize">Tú correo👇🏼</span>
          </span>
        </blockquote>
      </label>

      <input class="flex flex-col border-2 border-slate-900 border-dashed items-center py-2 px-4 rounded-xl"
           type="email" id="EmailUser" v-model="email" />
    </div>

    <div v-if="loading"
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status">
        <span
          class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
          >Enviando...</span
        >
    </div>

    <div v-if="sended"
    class="flex flex-col items-center gap-2">
      <label for="EmailUser">
        <blockquote class="text-xl sm:text-4xl font-semibold italic text-slate-900 py-2">
          <span class="before:block before:absolute before:-inset-1 before:-skew-y-2 before:bg-slate-900 relative inline-block">
            <span class="relative text-white capitalize">Revisa tú correo 🤍</span>
          </span>
        </blockquote>
      </label>

    </div>

    <div v-if="!sended && !loading" class=" flex gap-4">
      <button
        @click="open()"
        class="inline-block border-2 border-slate-900 border-dashed rounded-lg bg-white hover:bg-slate-100 border px-5 py-3 text-center text-sm font-semibold text-slate-900 sm:w-auto"
        href=""
      >
        X
      </button>
      <button 
        @click="sendLead()"
        class="bg-slate-900 border-2 border-white border-dashed hover:bg-indigo-300 rounded-lg px-4 py-2 text-white">
        Registrarme
      </button>
    </div>

    <div v-if="sended && !loading" class=" flex gap-4">
      <button
        @click="open()"
        class="inline-block border-2 border-slate-900 border-dashed rounded-lg bg-white hover:bg-slate-100 border px-5 py-3 text-center text-sm font-semibold text-slate-900 w-full"
        href=""
      >
        Cerrar
      </button>
    </div>
  </div>
</div>
</template>
