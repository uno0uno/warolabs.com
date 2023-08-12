<script setup>
const props = defineProps({
  title: { type: String },
});

const { title } = toRefs(props);
</script>

<template>
  <section class="">
    <div class="mx-auto max-w-screen-xl">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-lg font-bold"> Viajan &amp; no exploran</h2>
        <p
          class="
            mt-6
            text-3xl
            font-medium
            lg:leading-[54px]
            tracking-tight
            sm:text-4xl
            lg:text-5xl
            text-primary-500
          "
        >
          <span class="font-bold">10.000</span> 
          lugares que visitar <br class="hidden md:block" /> en
          <span class="font-bold text-yellow-500"> la ciudad</span> más vibrante!
        </p>
        <p class="mt-4 text-base font-normal text-gray-600">
          Disfruta de Bogotá, pero mira estos los siguientes datos
        </p>
      </div>

      <div class="mt-8 sm:mt-12">
        <dl class="flex gap-4">
          <div
            class="
              flex flex-col
              items-center
              p-4
              sm:p-6
              gap-2
              rounded-lg
              bg-slate-100
              w-1/2
            "
          >
            <dd class="text-4xl font-extrabold text-slate-900 md:text-5xl">
              63%
            </dd>
            <h3 class="text-center font-semibold">Viajeros se arrepienten</h3>
            <p class="p-cards">
              Cuando visitaron una nueva ciudad no pudieron conocer más que los
              mismos lugares
            </p>
          </div>
          <div
            class="
              flex flex-col
              p-4
              sm:p-6
              items-center
              gap-2
              rounded-lg
              bg-slate-100
              w-1/2
            "
          >
            <dd
              class="
                text-4xl text-center
                font-extrabold
                text-slate-900
                md:text-5xl
              "
            >
              72%
            </dd>
            <h3 class="text-center font-semibold">Conocen lo mismo</h3>
            <p class="p-cards">
              Viajeros solo visitan una fracción de los lugares que quieren
              visitar
            </p>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>
