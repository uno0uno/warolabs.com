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
        <h2 class="text-m font-semibold"> Viajan &amp; no exploran</h2>
        <p
          class="
            mt-4
            text-3xl
            font-semibold
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
        <dl class="flex flex-col sm:flex-row">
          <div
            class="
              flex
              items-center
              p-4
              sm:p-6
              gap-4
              sm:w-1/2
              border-y-4
              border-dashed
            "
          >
            <dd class="text-5xl font-extrabold text-slate-900 md:text-8xl">
              63%
            </dd>
            <div class="flex flex-col gap-2">
              <h3 class="text-center font-semibold">Viajeros se arrepienten</h3>
              <p class="p-cards">
                Cuando visitaron una nueva ciudad no pudieron conocer más que los
                mismos lugares
              </p>
            </div>
          </div>
          <div
            class="
              flex
              items-center
              p-4
              sm:p-6
              gap-4
              sm:w-1/2
              border-b-4
              sm:border-y-4
              border-dashed
            "
          >
            <dd
              class="
                text-5xl text-center
                font-extrabold
                text-slate-900
                md:text-8xl
              "
            >
              72%
            </dd>
            <div class="flex flex-col gap-2">
              <h3 class="text-center font-semibold">Conocen lo mismo</h3>
              <p class="p-cards">
                Viajeros solo visitan una fracción de los lugares que quieren
                visitar
              </p>
            </div>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>
