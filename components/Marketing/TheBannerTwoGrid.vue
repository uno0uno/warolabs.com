<script setup>

import { BoltIcon } from '@heroicons/vue/24/outline'
import { ReceiptPercentIcon } from '@heroicons/vue/24/outline'

</script>

<template>
    <div class="sm:flex justify-between  gap-2">
            <div class="relative mx-auto flex flex-col items-center md:w-3/4 max-w-container gap-6">
                    <div class=" h-7 text-base font-semibold leading-7" aria-hidden="true">
                        <div class="flex gap-4">
                            <div class="flex items-center gap-1">
                                <ReceiptPercentIcon class="h-4 w-4 md:h-4 md:w-4 text-sky-500"/>
                                <p class="text-sm text-slate-500"
                                >$800 COP</p>
                            </div>
                            <div class="flex items-center gap-1">
                                <BoltIcon class="h-4 w-4 md:h-4 md:w-4 text-sky-500"/>
                                <p class="text-sm text-slate-500"
                                >Simple y 100% online.</p>
                            </div>
                        </div>
                    </div>
                    <h1 class="max-w-[36rem] text-center text-4xl font-extrabold font-principal tracking-tight text-slate-900 sm:text-6xl md:text-6xl">
                        Ahora puedes cobrar en dolares.
                    </h1>
                    <p class="col-start-1 row-start-3 max-w-lg text-center text-normal text-slate-900">
                        Permite que tus clientes escaneen tu codigo Qr, nosotros convertimos y consignamos tu dinero en el banco que desees.
                    </p>
                    <div class="flex flex-col w-full sm:w-auto space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                        <a class="inline-flex justify-center rounded-lg text-sm font-semibold py-3 px-4 bg-slate-900 text-white hover:bg-slate-700 cursor-pointer">
                            <span>Registrarme gratis<!-- --> 
                                <span aria-hidden="true" class="hidden text-slate-400 sm:inline">
                                    →
                                </span>
                            </span>
                        </a>
                    </div>
            </div>
    </div>

</template>

