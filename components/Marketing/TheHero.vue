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
        class="text-4xl leading-10 font-bold tracking-tight text-primary-500 sm:text-4xl md:text-5xl lg:text-6xl  sm:leading-12"
      >  
        tu guía de bares &amp;  restaurantes para explorar Bogotá
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
      traemos las opiniones más honestas y confiables para que la pases delicioso con las personas que amas
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
              >personas reales, con opiniones reales</span
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
              reseñas, guías honestas y confiables
            </p>
    
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
          <div class="">
                <CommonTheNewLead ></CommonTheNewLead>
          </div>

          </div>
        </div>
    
      </div>
    </div>
  </div>
</template>
