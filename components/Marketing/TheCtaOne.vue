<script setup>

</script>

<template>
<section class="overflow-hidden items-center flex flex-col sm:flex-row gap-2">
  <img
    alt="Student"
    v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/QmY3FXUVUSZ7imPfNEgBYGGkrnY6gWZe3LJe5tiB1WzVw4`, 'alt':` | waro colombia`}"
    class="h-56 w-full object-cover sm:h-64 rounded-lg"
  />
  <div class="p-6">
    <div
      class="flex flex-col gap-6 mx-auto max-w-xl text-center ltr:sm:text-left rtl:sm:text-right"
    >
      <h2 class="text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Las inscripciones al programa están cerradas.
      </h2>

       <p class="hidden text-gray-500 md:block">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et, egestas
        tempus tellus
      </p>

      <div class="flex flex-col w-full space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <a class="inline-flex w-full justify-center rounded-lg text-sm font-semibold py-3 px-4 bg-slate-900 text-white hover:bg-slacursor-pointer">
              <span>Apúntarme a lista de espera<!-- --> 
                  <span aria-hidden="true" class="hidden text-slate-400 sm:inline">
                      →
                  </span>
              </span>
          </a>
      </div>
    </div>
  </div>


</section>

</template>