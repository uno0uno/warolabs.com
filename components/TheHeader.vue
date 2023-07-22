<script setup></script>

<template>
  <nav class="bg-white z-20 top-0">
    <div
      class="
        max-w-screen-xl
        flex flex-wrap
        items-center
        justify-between
        mx-auto
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
        style="list-style: none"
      >
        <div class="cursor-pointer">
          <NuxtLink :to="{ path: `/` }">
            <theImgLogo />
          </NuxtLink>
        </div>
      </div>
      <div class="flex flex-col sm:gap-2 gap-4">
        <div class="flex items-center justify-end gap-2">
          <div
            class="
              flex flex-col
              w-full
              sm:w-auto
              space-y-2
              sm:flex-row sm:space-x-4 sm:space-y-0
            "
          >
            <a
              class="
                inline-flex
                justify-center
                rounded-lg
                text-sm
                font-semibold
                py-2
                px-4
                bg-slate-900
                text-white
                hover:bg-slate-700
                cursor-pointer
              "
            >
              <span>Registrarme </span>
            </a>
          </div>
          <div class="md:flex md:gap-1 hidden">
            <LogosTheNewsletter class="block md:h-8 md:w-8" />
            <LogosTheTikTok class="block md:h-8 md:w-8" />
            <LogosTheTwitter class="block md:h-8 md:w-8" />
          </div>

          <button
            data-collapse-toggle="navbar-sticky"
            type="button"
            class="
              inline-flex
              items-center
              p-2
              w-10
              h-10
              justify-center
              text-sm text-gray-500
              rounded-lg
              md:hidden
              hover:bg-gray-100
              focus:outline-none focus:ring-2 focus:ring-gray-200
            "
            aria-controls="navbar-sticky"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <div
          class="items-center justify-between hidden w-full md:flex md:w-auto"
          id="navbar-sticky"
        >
          <ul
            class="
              flex
              justify-start
              items-center
              gap-4
              sm:text-2xl
              md:text-3xl
              text-slate-900
              font-extrabold
            "
          >
            <li>
              <NuxtLink :to="{ path: '/discotecas' }"> Discotecas </NuxtLink>
            </li>
            <li>
              <NuxtLink :to="{ path: '/promociones' }"> Promociones </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
