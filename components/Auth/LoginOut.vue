<script setup></script>

<template>

<section class="bg-white">
  <div class="lg:grid lg:min-h-1/2 lg:grid-cols-12">
    <section
      class="relative flex h-32 items-end bg-slate-900 rounded-lg lg:col-span-5 lg:h-full xl:col-span-6"
    >

      <div class="hidden lg:relative lg:block lg:p-12">
        <div class="block text-white" >
          <span class="sr-only">Home</span>
            <LogosTheColombia
              class="w-14 h-14 text-white"
            
            ></LogosTheColombia>
        </div>

        <h2 class="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          Sumerce!
        </h2>

        <p class="mt-4 leading-relaxed text-white/90">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eligendi nam
          dolorum aliquam, quibusdam aperiam voluptatum.
        </p>
      </div>
    </section>

    <main
      class="flex items-center justify-center px-8 py-4 sm:px-12 lg:col-span-7 lg:px-16 lg:py-4 xl:col-span-6"
    >
      <div class="max-w-xl lg:max-w-3xl">
        <div class="relative -mt-16 block lg:hidden">
          <div
            class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 sm:h-20 sm:w-20"

          >
            <span class="sr-only">Home</span>
            <LogosTheColombia
              class="w-10 h-10 text-slate-900"
            
            ></LogosTheColombia>

          </div>

          <h1
            class="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl"
          >
            Sumerce!
          </h1>

          <p class="mt-4 leading-relaxed text-gray-500">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eligendi
            nam dolorum aliquam, quibusdam aperiam voluptatum.
          </p>
        </div>

        <form action="#" class="mt-8 grid grid-cols-6 gap-6">


          <div class="col-span-6">
            <label for="Email" class="block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              id="Email"
              name="email"
              class="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
            />
          </div>

          <div class="col-span-6 sm:col-span-3">
            <label
              for="Password"
              class="block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              type="password"
              id="Password"
              name="password"
              class="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
            />
          </div>

          <div class="col-span-6 sm:col-span-3">
            <label
              for="PasswordConfirmation"
              class="block text-sm font-medium text-gray-700"
            >
              Password Confirmation
            </label>

            <input
              type="password"
              id="PasswordConfirmation"
              name="password_confirmation"
              class="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
            />
          </div>

          <div class="col-span-6">

          </div>

          <div class="col-span-6">
            <p class="text-sm text-gray-500">
              By creating an account, you agree to our
              <a href="#" class="text-gray-700 underline">
                terms and conditions
              </a>
              and
              <a href="#" class="text-gray-700 underline">privacy policy</a>.
            </p>
          </div>

          <div class="col-span-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
            <button
              class="inline-block shrink-0 rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Crear una cuenta
            </button>
             <button
              class="inline-block shrink-0 rounded-md border border-slate-900 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition  focus:outline-none focus:ring active:text-blue-500"
            >
              Iniciar sesion
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</section>

</template>

<style scoped></style>
