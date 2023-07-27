<script setup>


</script>
<template>
<div class="flex flex-col items-left gap-2">

    <blockquote class="text-4xl font-semibold italic text-slate-900 py-2">
      Escribe un
      <span class="before:block before:absolute before:-inset-1 before:-skew-y-2 before:bg-slate-900 relative inline-block">
        <span class="relative text-white">comentario</span>
      </span>
    </blockquote>


   <div class="flex gap-2">
      <input type="radio" name="reaction" id="fire" class="hidden sm:hidden peer/fire"/>
      <label for="fire" class="p-3 rounded-lg border cursor-pointer peer-checked/fire:bg-slate-100">
          <LogosThefire class="h-6 w-6 md:h-8 md:w-8 text-slate-900"/>
      </label>

      <input type="radio" name="reaction" id="smiling" class="hidden sm:hidden peer/smiling" />
      <label for="smiling" class=" p-3 rounded-lg border cursor-pointer peer-checked/smiling:bg-slate-100">
          <LogosTheSmiling class="h-6 w-6 md:h-8 md:w-8 text-slate-900"/>
      </label>

      <input type="radio" name="reaction" id="nauseated" class="hidden sm:hidden peer/nauseated"/>
      <label for="nauseated" class="p-3 rounded-lg border cursor-pointer peer-checked/nauseated:bg-slate-100">
          <LogosTheNauseated class="h-6 w-6 md:h-8 md:w-8 text-slate-900 "/>
      </label>

      <input type="radio" name="reaction" id="zzz" class="hidden sm:hidden peer/zzz"/>
      <label for="zzz" class="p-3 rounded-lg border cursor-pointer peer-checked/zzz:bg-slate-100">
        <LogosTheZzz class="h-6 w-6 md:h-8 md:w-8 text-slate-900"/>
      </label>
    </div>
   <div>
   <div class="flex flex-col gap-2">
    <div class="flex flex-col gap-1">
        <label for="nombre" class="text-2xl font-normal italic">Correo electrónico</label>
        <input type="email" id="nombre" class="rounded-md text-gray-700 p-2" />
    </div>
      <div class="flex flex-col gap-1">
        <label for="nombre" class="text-2xl font-normal italic">Tú opinion</label>
        <textarea  id="nombre" class="rounded-md text-gray-700 p-2" />
    </div>
   </div>
   </div>
</div>
</template>