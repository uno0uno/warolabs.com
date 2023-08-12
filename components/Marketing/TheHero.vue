<script setup></script>

<template>
  <div class="flex flex-col pt-2  sm:pt-12 lg:flex-row sm:items-center sm:justify-center">
    <div
      class="
        flex
        flex-col
        gap-0
        sm:gap-4
        text-left
        w-full
        shrink-0
        space-y-3
        md:text-center
        lg:mx-0
        sm:text-center
      "
    >
      <h1
        class="text-2xl leading-[1.6rem] font-bold tracking-tight text-primary-500 sm:text-4xl sm:leading-[3rem] lg:text-6xl"
      >
         La guía cultura para viajeros que <br class="hidden md:block" /> quieren explorar Bogotá
      </h1>
      <div class="flex justify-center">
      <p
        class="
          text-m
          leading-[1.4rem]
          md:text-lg
          font-normal
          sm:w-1/2
          md:leading-[1.8rem]
          text-gray-600
        "
      >
        Ofrecemos sugerencias personalizadas de lugares &amp; experiencias que se alinean con tus gustos a través de un pago único para que puedas disfrutarlo. 
      </p>
      </div>
      <div class="relative space-y-5">
        <div class="flex flex-col space-y-1">
          <div class="flex gap-2 items-center justify-start sm:justify-center">
            <LogosTheCheck class="h-3 w-3 md:h-6 md:w-6 text-slate-900"/>
            <span           
            class="          
          text-xs
          leading-[1.4rem]
          md:text-lg
          font-normal
          md:leading-[1.8rem]
          text-gray-600"
              >Verificamos con AI nuestras opiniones</span
            >
          </div>
          <div class="flex gap-2 items-center justify-start sm:justify-center">
            <LogosTheCheck class="h-3 w-3 md:h-6 md:w-6 text-slate-900"/>
            <p           
              class="          
            text-xs
            leading-[1.4rem]
            md:text-lg
            font-normal
            md:leading-[1.8rem]
            text-gray-600">
              Usamos analisis de sentimiento, segun opinion
            </p>
    
          </div>
          <div class="flex gap-2 items-center flex items-center justify-start sm:justify-center justify-start">
            <LogosTheCheck class="h-3 w-3 md:h-6 md:w-6 text-slate-900"/>
            <span 
          class="          
          text-xs
          leading-[1.4rem]
          md:text-lg
          font-normal
          md:leading-[1.8rem]
          text-gray-600"
              >expertos locales verifican recomendaciones</span
            >
          </div>
        </div>
        <div class="space-x-2">
          <div
            class="
              flex
              gap-4
              items-center
              content-center
              sm:justify-center sm:gap-6
            "
          >
            <a href="/" class=""
              ><button
                role="button"
                class="
                  inline-flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border border-transparent
                  bg-slate-900
                  px-4
                  py-2
                  text-base
                  font-semibold
                  leading-6
                  text-white
                  shadow-sm
                  transition-all
                  duration-150
                  hover:bg-gray-500
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-primary-500
                  sm:w-auto
                "
              >
                <span >Empezar gratis</span>
                <LogosTheArrowRight class="h-5 w-5 text-white"/>
  
                </button
            ></a>

          </div>
        </div>
    
      </div>
    </div>
  </div>
</template>
