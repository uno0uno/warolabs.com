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

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class=" relative flex flex-col items-center p-6 gap-2 rounded-lg bg-slate-50"> 
            <div class="p-4 bg-slate-900 rounded-lg">
              <LogosTheClose class="h-6 w-6 md:h-6 md:w-6 text-white"/>
            </div>
            <h4 class="text-xl font-bold leading-snug tracking-tight mb-1">
              Inteligencia artificial
            </h4>
            <p class="text-gray-600 text-center">
              Las reseñas falsas generadas por IA están aumentando.
            </p>
          </div>
          <div class=" relative flex flex-col items-center p-6 gap-2 rounded-lg bg-slate-50"> 
            <div class="p-4 bg-slate-900 rounded-lg">
              <LogosTheDisappointed class="h-6 w-6 md:h-6 md:w-6 text-white"/>
            </div>
            <h4 class="text-xl font-bold leading-snug tracking-tight mb-1">
              Reseñas pagas
            </h4>
            <p class="text-gray-600 text-center">
              Paginas ofrecen dinero a cambio de esa "opinión"
            </p>
          </div>
          <div class=" relative flex flex-col items-center p-6 gap-2 rounded-lg bg-slate-50"> 
            <div class="p-4 bg-slate-900 rounded-lg">
              <LogosTheTrash class="h-6 w-6 md:h-6 md:w-6 text-white"/>
            </div>
            <h4 class="text-xl font-bold leading-snug tracking-tight mb-1">
              Spam con viajes
            </h4>
            <p class="text-gray-600 text-center">
              correos electronicos relacionado con viajes (3 de 5) son estafas.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
