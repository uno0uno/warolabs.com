<script setup>
const { userBusiness } = useRoute().params;

const {
  data: business,
  pending,
  refresh,
  execute,
  error,
} = await useAsyncData('profile-info', () => {
  try {
    return $fetch(`/api/business/profileInfo?user_name=${userBusiness}`);
  } catch (error) {
    return error;
  }
});
</script>

<template>

  <div v-if="pending">LOADING...</div>
  <div v-else-if="error">Error al cargar los datos: {{ error }}</div>
  <div v-else-if="business.length === 0">Not found</div>
  <div v-else-if="business.code == '22P02'">Not found</div>
  <div
    v-else
    v-for="nightClub in business"
    :key="nightClub.name"
    class="flex flex-col gap-6"
    itemscope
    itemtype="https://schema.org/NightClub"
  >
    <CommonTheBreadcrumb></CommonTheBreadcrumb>
    <TheBusinessHeader
      v-bind:logo_bussines="nightClub.logo_business"
      v-bind:name="nightClub.name"
      v-bind:address="nightClub.address"
      v-bind:country="nightClub.country"
      v-bind:city="nightClub.city"
      v-bind:description="nightClub.description"
      v-bind:whatsapp="nightClub.whatsapp"
      v-bind:min_price="nightClub.min_price"
      v-bind:max_price="nightClub.max_price"
      v-bind:category_tags="nightClub.category_tags"
    >
    </TheBusinessHeader>
    <div class="mx-auto max-h-full font-principal">
      <div
        class="
          border-0 border-b-[1px] border-solid border-b-border-primary
          flex-nowrap flex
          overflow-x-auto overflow-y-hidden
          jpg-scrollbar-thumb-none
          mx-0
        "
      >
        <h2
          class="
            text-lg text-slate-900
            first:ml-0
            inline-flex
            text-m
            md:text-xl
            font-bold
            capitalize
            hover:text-text-default
            relative
            bg-transparent
            outline-none
            mx-4
            mb-[-1px]
            border-0 border-b-[3px] border-solid
            pb-2
            whitespace-nowrap
            border-b-text-link
            text-text-link
            mr-1
          "
        >
          Promociones
        </h2>
      </div>
      <TheBusinessCombos v-bind:promos="nightClub.promos_business">
      </TheBusinessCombos>
    </div>

    <div class="">
      <div
        class="
          border-0 border-b-[1px] border-solid border-b-border-primary
          flex-nowrap flex
          overflow-x-auto overflow-y-hidden
          jpg-scrollbar-thumb-none
          mx-0
        "
      >
        <h2
          class="
            text-lg text-slate-900
            first:ml-0
            inline-flex
            text-m
            md:text-xl
            font-bold
            capitalize
            hover:text-text-default
            relative
            bg-transparent
            outline-none
            mx-4
            mb-[-1px]
            border-0 border-b-[3px] border-solid
            pb-2
            whitespace-nowrap
            border-b-text-link
            text-text-link
            mr-1
          "
        >
          FAQs de {{ nightClub.name }}
        </h2>
      </div>
    </div>

    <ProfileTheFaqs
      v-bind:how_party="nightClub.how_party"
      v-bind:opening_hours="nightClub.opening_hours"
    >
    </ProfileTheFaqs>

    <Head>
      <Title>{{ nightClub.name }} | Waro Colombia </Title>
      <Meta
        property="og:title"
        v-bind="{ content: `${nightClub.name} | Waro Colombia` }"
      />
      <Meta name="description" v-bind="{ content: `${nightClub.how_party}` }" />
      <Meta property="og:description" :content="nightClub.how_party" />
      <Meta
        property="og:image"
        v-bind="{
          content: `https://warocolombia.infura-ipfs.io/ipfs/${nightClub.logo_business}`,
        }"
      />
      <Meta name="twitter:card" content="summary_large_image" />
    </Head>
  </div>
</template>
