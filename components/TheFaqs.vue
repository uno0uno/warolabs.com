<template>
    <div
  class="divide-y divide-slate-200 rounded-xl border-2 border-slate-200 bg-slate-100 font-principal">
  <details class="group p-4 [&_summary::-webkit-details-marker]:hidden">
    <summary
      class="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900"
    >
      <h2 class="text-lg font-medium">
        ¿Cómo es la rumba aquí?
      </h2>

      <span class="relative h-5 w-5 shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </span>
    </summary>
    <p itemprop="description" class="mt-4 leading-relaxed text-slate-900">
      Disfruta de Dancehall y Rap en Bogotá, Parque El Virrey. ¡Parqueadero gratis disponible! ¡Reserva ahora y vive la música al máximo!
    </p>

  </details>

  <details class="group p-4 [&_summary::-webkit-details-marker]:hidden bg-slate-100">
    <summary
      class="flex cursor-pointer items-center justify-between gap-1.5 text-slate-900"
    >
      <h2 class="text-lg font-medium">
        ¿A que horas abren o cierran?
      </h2>

      <span class="relative h-5 w-5 shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </span>
    </summary>

    <TheOpeningHoursSpecification class="mt-4 leading-relaxed">
        
    </TheOpeningHoursSpecification>
  </details>
</div>
</template>

<script setup>

</script>
