<script setup>

import { BoltIcon } from '@heroicons/vue/24/outline'
import { ReceiptPercentIcon } from '@heroicons/vue/24/outline'

</script>

<template>
<div class="flex flex-col gap-14 sm:gap-20 font-principal">
    <div class="sm:flex justify-between sm:mt-2 gap-2">
            <div class="relative mx-auto flex flex-col items-center sm:items-start md:w-3/4 max-w-container gap-6 sm:gap-8">
                    <div class=" h-7 text-base font-semibold leading-7" aria-hidden="true">
                        <div class="flex gap-2">
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
                    <h1 class="max-w-[36rem] text-center sm:text-left text-4xl font-bold text-slate-900 sm:text-6xl md:text-6xl">
                        Ahora puedes cobrar en dolares
                    </h1>
                    <p class="col-start-1 row-start-3 max-w-lg text-center sm:text-left text-normal text-slate-900">
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
        <div class="sm:flex object-none">
            <img class="md:rounded-xl rounded-xl object-cover sm:w-80 ml-auto"
            v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/QmeseCtWSrv9XAMzcgy2BngyMVvcVygHy9ktXvQ2shdAeS`, 'alt':'QmXkgdEiiVjuH1K1uHdqYtDz5ApU85r2PdUu1DydCxJo7P'}">
        </div>
    </div>

    <div class="flex flex-col-reverse sm:flex-row justify-between sm:mt-2 gap-2">

            <div class="md:flex object-none">
                <img class="md:rounded-xl rounded-xl object-cover sm:w-80 ml-auto"
                v-bind="{'src':`https://warocolombia.infura-ipfs.io/ipfs/QmdaD8Gq2u1QZHLmBkM4m7VUBL7U6UQ7K6KxCDdsf3qya1`, 'alt':'QmXkgdEiiVjuH1K1uHdqYtDz5ApU85r2PdUu1DydCxJo7P'}">
            </div>

        <div class="relative mx-auto flex flex-col items-center sm:items-end md:w-3/4 max-w-container gap-6 sm:gap-8">
            <div class="h-7 text-base font-semibold leading-7" aria-hidden="true">
                <div class="flex gap-2">
                <div class="flex items-center gap-1">
                    <ReceiptPercentIcon class="h-4 w-4 md:h-4 md:w-4 text-sky-500" />
                    <p class="text-sm text-slate-500">Programa artistas</p>
                </div>
                <div class="flex items-center gap-1">
                    <BoltIcon class="h-4 w-4 md:h-4 md:w-4 text-sky-500" />
                    <p class="text-sm text-slate-500">Simple y 100% online.</p>
                </div>
                </div>
            </div>
                <h1 class="text-4xl max-w-[36rem] font-extrabold text-center sm:text-right font-principal tracking-tight text-slate-900 sm:text-6xl md:text-6xl">
                    Tus fans pueden donarte.
                </h1>
                <p class="max-w-lg text-normal text-center sm:text-right text-slate-900">
                    hacemos que el apoyo sea divertido y sencillo. Tus fans pueden realizar el pago en dolar digital y dejar un mensaje.
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
</div>
</template>

