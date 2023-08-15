<script setup></script>

<template>
  <section>
    <div class="max-w-screen-xl">
      <div class="grid grid-cols-1 gap-8 items-center gap-x-4">
        <div       class="
        w-full
        shrink-0
        space-y-3
        text-center
        lg:mx-0
        sm:text-center
      ">

          <h2
            class="
            text-3xl
            font-semibold
            lg:leading-[54px]
            tracking-tight
            sm:text-4xl
            lg:text-5xl
            text-primary-500
            "
          >
            Internet esta repleto <br /> de <span class="font-bold text-red-500">reseñas falsas</span> 
          </h2>
        </div>

        <div class="flex gap-4">
          <div
            class="
              relative
              flex flex-col
              items-center
              p-4
              sm:p-6
              gap-2
              rounded-lg
              border-4
              border-dashed
              w-1/2
            "
          >
            <h3 class="text-center font-semibold text-center font-semibold sm:text-2xl">
              Reseñas pagas
            </h3>
            <p class="p-cards">
              Ves una opinión, pero no sabes si es real. Muchas de ellas son
              pagas
            </p>
          </div>
          <div
            class="
              relative
              flex flex-col
              items-center
              p-4
              sm:p-6
              gap-2
              rounded-lg
              border-4
              border-dashed
              w-1/2
            "
          >
            <h3 class="text-center font-semibold sm:text-2xl">
              Spam con viajes
            </h3>
            <p class="p-cards">
              Casi dos tercios de los correos electrónicos de viaje son spam
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
