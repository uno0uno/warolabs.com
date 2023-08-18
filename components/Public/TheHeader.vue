<script setup></script>

<template>
  <nav class="bg-white top-0 border-b-4 border-dashed border-slate-900 pb-4">
    <div
      class="
        flex
        items-center
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
      <div class="flex items-center sm:gap-2 gap-1">
        <div
          class="items-center justify-between w-full md:flex md:w-auto"
          id="navbar-sticky"
        >
          <ul
            class="
              flex
              justify-end
              px-2
              sm:p-0
              items-center
              gap-4
              text-lg
              text-slate-900
              font-extrabold
            "
          > 
            <li class="text-3xl">
              <NuxtLink :to="{ path: '/blog' }"> Blog </NuxtLink>
            </li>
          </ul>
        </div>
                <div class="flex items-center sm:justify-end gap-2">

          <div class="flex gap-1 items-center">
            <a href="https://www.tiktok.com/@saifer101_" target="_blank">
              <LogosTheTikTok class="h-8 w-8 cursor-pointer" />
            </a>
            <a href="https://twitter.com/saifer101_" target="_blank">
              <LogosTheX class="h-10 w-10 cursor-pointer" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
