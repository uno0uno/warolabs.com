<script setup></script>

<template>
  <nav class="bg-white z-20 top-0 border-b-2 pb-2">
    <div
      class="
        flex flex-col sm:flex-row
        sm:items-center
        justify-between
        mx-auto
        gap-2
      "
    >
      <div
        class="
          flex
          justify-start
          items-center
          gap-2
          text-lg text-slate-600
          font-bold
        "
      >
        <div class="cursor-pointer">
          <NuxtLink :to="{ path: `/` }">
            <theImgLogo />
          </NuxtLink>
        </div>
      </div>
      <div class="flex flex-col sm:gap-2 gap-1">
        <div class="flex items-center sm:justify-end gap-2">

          <div class="flex gap-1">
            <a href="https://www.tiktok.com/@saifer101_" target="_blank">
              <LogosTheTikTok class=" h-8 w-8 cursor-pointer" />
            </a>
            <a href="https://twitter.com/saifer101_" target="_blank">
              <LogosTheX class="h-9 w-9 cursor-pointer" />
            </a>
          </div>
        </div>
        <div
          class="items-center justify-between w-full md:flex md:w-auto"
          id="navbar-sticky"
        >
          <ul
            class="
              flex
              justify-start
              items-center
              gap-4
              text-lg
              sm:text-2xl
              lg:text-3xl
              text-slate-900
              font-extrabold
            "
          > 
            <li>
              <NuxtLink :to="{ path: '/articulos' }"> Blog </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="{ path: '/articulos' }"> Nosotros </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
