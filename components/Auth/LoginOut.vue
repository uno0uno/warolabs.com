<script setup>
import { createClient } from '@supabase/supabase-js';

const { public: { supabaseUrl, supabaseAnonKey }, } = useRuntimeConfig()

const supabase = createClient( supabaseUrl, supabaseAnonKey);

async function loginthroughOTP (){

  const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
    options: {
      redirectTo: 'https://warocol.com'
    }
  })
}



</script>

<template>

<section class="bg-white">
  <div class="lg:grid lg:min-h-auto lg:grid-cols-12">
    <section
      class="relative flex h-32 items-end bg-black rounded-lg lg:col-span-5 lg:h-full xl:col-span-6"
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

        <div class="mt-8 grid grid-cols-6 gap-6">
        <div class="col-span-6">
            <h2 class="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
              Elige tu plataforma favorita 👇🏼
            </h2>
          </div>
          <div class="col-span-6 flex flex-col gap-2">
          <div class=" ">

            <button @click="loginthroughOTP()"
            class="flex gap-2 items-center justify-center rounded-lg text-sm font-semibold py-2 px-4 bg-white text-slate-900 border border-2 border-color-black cursor-pointer w-full" >
              <LogosTheGoogle
                class="w-4 h-4 text-slate-900"
              ></LogosTheGoogle>
              Google
            </button>
          </div>

          <div class="flex w-full  gap-2">
            <button class="flex gap-2 items-center justify-center rounded-lg text-sm font-semibold py-2 px-4 bg-white text-slate-900 border border-2 border-color-black cursor-pointer w-full" >
              <LogosTheApple
                class="w-4 h-4 text-slate-900"
              ></LogosTheApple>
              Apple
            </button>

        
            <button class="flex gap-2 items-center justify-center rounded-lg text-sm font-semibold py-2 px-4 bg-white text-slate-900 border border-2 border-color-black cursor-pointer w-full" >
              <LogosTheMicrosoft
                class="w-4 h-4 text-slate-900"
              ></LogosTheMicrosoft>
              Microsoft
            </button>

          </div>
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
            <blockquote class="rounded-lg bg-slate-50 p-4">
              <div class="flex items-center gap-4">
                <img
                  alt="Man"
                  src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1180&q=80"
                  class="h-16 w-16 rounded-lg object-cover"
                />


                <p class="line-clamp-2 sm:line-clamp-none text-stale-900 text-sm text-gray-500">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt
                  voluptatem alias ut provident sapiente repellendus.
                </p>
              </div>
            </blockquote>
          </div>
        </div>
      </div>
    </main>
  </div>
</section>

</template>

<style scoped></style>
