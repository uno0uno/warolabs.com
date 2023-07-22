<script setup>

const route = useRoute();
const path = ref();

watchEffect(() => {
  path.value = route.path.split('/');
  console.log(path.value[1] == '');
});

</script>

<template>
  <nav v-if="path[1] !== ''" aria-label="Breadcrumb">
    <ol class="flex items-center gap-1 text-sm text-gray-600">
      <li class="rtl:rotate-180">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </li>

      <li>
      <NuxtLink :to="{ path: path[1] }">
        {{path[1]}}
      </NuxtLink>
      </li>
    </ol>
  </nav>
</template>

<style lang="scss" scoped></style>
