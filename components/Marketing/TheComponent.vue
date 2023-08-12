<script setup></script>

<template>
  <section>
    <div class="max-w-screen-xl">
      <div class="grid grid-cols-1 gap-y-8 items-center gap-x-4">
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="text-center text-3xl font-bold tracking-tight sm:text-5xl">
            Internet esta repleto de reseñas y calificaciones falsas
          </h2>
        </div>

        <div class="flex gap-4">
          <div class=" relative flex flex-col items-center p-2 py-4 sm:p-6 gap-2 rounded-lg bg-slate-50 w-1/2"> 
            <div class="p-4 bg-slate-900 rounded-lg">
              <LogosTheDisappointedFull class="h-4 w-4 md:h-6 md:w-6 text-white"/>
            </div>
            <h4 class="text-xl text-center font-bold leading-snug tracking-tight mb-1">
              Reseñas pagas
            </h4>
            <p class="text-gray-600 text-sm sm:text-lg text-center">
              Ves una opinión, pero no sabes si es real. Muchas de ellas son pagas
            </p>
          </div>
          <div class=" relative flex flex-col items-center p-2 py-4  sm:p-6 gap-2 rounded-lg bg-slate-50 w-1/2"> 
            <div class="p-4 bg-slate-900 rounded-lg">
              <LogosTheTrash class="h-4 w-4 md:h-6 md:w-6 text-white"/>
            </div>
            <h4 class="text-xl text-center font-bold leading-snug tracking-tight mb-1">
              Spam con viajes
            </h4>
            <p class="text-gray-600 text-sm sm:text-lg  text-center">
              Casi dos tercios de los correos electrónicos de viaje son spam.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
