<script setup>

const props = defineProps({
  title: { type: String },
});

const { title } = toRefs(props);

</script>

<template>
  <section class="">
    <div class="mx-auto max-w-screen-xl">
      <div class="
        text-left
        w-full
        shrink-0
        space-y-3
        md:text-center
        lg:mx-0
        sm:text-center">
        <h2
          class="
          text-3xl
          font-medium
          tracking-tight
          sm:text-5xl
          text-primary-500
          "
        >
          {{title}}
        </h2>

      </div>

      <div class="mt-8 sm:mt-12">
        <dl class="flex  gap-4">

          <div class=" flex flex-col items-center p-2 py-4 gap-2 rounded-lg bg-slate-50 sm:w-1/2"> 
                <dd class="text-4xl font-extrabold text-slate-900 md:text-5xl">
                  63%
                </dd>
                <h4 class="text-md lg:text-lg font-bold text-primary-500">
                  Viajeros se arrepienten
                </h4>
                <p class="text-gray-600 text-sm sm:text-lg  text-center">
                  Cuando visitaron una nueva ciudad no pudieron conocer más que los mismos lugares .
                </p>
          </div>
          <div class="lex flex-col text-sm sm:text-lg text-center p-2 py-4 gap-2 rounded-lg bg-slate-50 sm:w-1/2"> 
                <dd class="text-4xl text-center font-extrabold text-slate-900 md:text-5xl">
                  72%
                </dd>
                <h4 class="text-md lg:text-lg font-bold text-primary-500">
                  Conocen lo mismo
                </h4>
                <p class="text-gray-600 text-sm sm:text-lg  text-center">
                  Viajeros solo visitan una fracción de los lugares que quieren visitar.
                </p>
          </div>

        </dl>
      </div>
    </div>
  </section>
</template>
