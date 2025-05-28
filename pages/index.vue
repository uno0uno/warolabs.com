<script setup>
import { HomeIcon, InformationCircleIcon, BriefcaseIcon, Squares2X2Icon, PhoneIcon } from '@heroicons/vue/24/outline';


definePageMeta({
  layout: 'landing',
});

const title = 'descubre el poder de la inteligencia artificial. fácil y para todos';
const description = 'únete a nuestra comunidad y participa en discusiones mensuales sobre cómo la IA está transformando nuestro mundo. --sin tecnicismos, solo ideas claras';
const title2 = 'en nuestros labs mensuales, exploramos temas como';
const description2 = 'desentrañamos un tema clave de la IA en un lenguaje sencillo';
const title3 = 'da el primer paso para entender la inteligencia artificial';
const description3 = ' Aprende qué es y cómo funciona la IA en nuestros labs para principiantes';
const image3 = [{
  src: 'https://dummyimage.com/800x500',
  alt: 'Image 1',
  width: 500,
  height: 800,
  lazy: true,
  className: 'image-class-1',
}]

const images = [
  {
    src: 'https://dummyimage.com/400x200',
    alt: 'Image 1',
    width: 300,
    height: 200,
    lazy: true,
    className: 'image-class-1',
  },
  {
    src: 'https://dummyimage.com/400x200',
    alt: 'Image 2',
    width: 300,
    height: 200,
    lazy: false,
    className: 'image-class-2',
  },
  {
    src: 'https://dummyimage.com/400x200',
    alt: 'Image 3',
    width: 300,
    height: 200,
    lazy: true,
    className: 'image-class-3',
  },
  {
    src: 'https://dummyimage.com/400x200',
    alt: 'Image 1',
    width: 300,
    height: 200,
    lazy: true,
    className: 'image-class-1',
  },
  {
    src: 'https://dummyimage.com/400x200',
    alt: 'Image 2',
    width: 300,
    height: 200,
    lazy: false,
    className: 'image-class-2',
  },
  {
    src: 'https://dummyimage.com/400x200',
    alt: 'Image 3',
    width: 300,
    height: 200,
    lazy: true,
    className: 'image-class-3',
  },
];

const itemsCluster = [
  {
    icon: HomeIcon,
    title: '¿Te Parece Complicado?',
    description: ' Aprender Inteligencia Artificial Fácil es Posible: Desmitificamos la IA para no técnicos, explicándola paso a paso',
    size: 14,
  },
  {
    icon: HomeIcon,
    title: '¿Te Parece Complicado?',
    description: ' Aprender Inteligencia Artificial Fácil es Posible: Desmitificamos la IA para no técnicos, explicándola paso a paso',
    size: 14,
  },
  {
    icon: HomeIcon,
    title: '¿Te Parece Complicado?',
    description: ' Aprender Inteligencia Artificial Fácil es Posible: Desmitificamos la IA para no técnicos, explicándola paso a paso',
    size: 14,
  },
  {
    icon: HomeIcon,
    title: '¿Te Parece Complicado?',
    description: ' Aprender Inteligencia Artificial Fácil es Posible: Desmitificamos la IA para no técnicos, explicándola paso a paso',
    size: 14,
  },
  {
    icon: HomeIcon,
    title: '¿Te Parece Complicado?',
    description: ' Aprender Inteligencia Artificial Fácil es Posible: Desmitificamos la IA para no técnicos, explicándola paso a paso',
    size: 14,
  },
  {
    icon: HomeIcon,
    title: '¿Te Parece Complicado?',
    description: ' Aprender Inteligencia Artificial Fácil es Posible: Desmitificamos la IA para no técnicos, explicándola paso a paso',
    size: 14,
  },
];

const images4 = [
  {
    src: 'https://dummyimage.com/80x60',
    alt: 'Image 1',
    width: 80,
    height: 60,
    lazy: true,
    className: 'image-class-1',
  },
  {
    src: 'https://dummyimage.com/80x60',
    alt: 'Image 2',
    width: 80,
    height: 60,
    lazy: false,
    className: 'image-class-2',
  },
  {
    src: 'https://dummyimage.com/80x60',
    alt: 'Image 3',
    width: 80,
    height: 60,
    lazy: true,
    className: 'image-class-3',
  },
  {
    src: 'https://dummyimage.com/80x60',
    alt: 'Image 1',
    width: 80,
    height: 60,
    lazy: true,
    className: 'image-class-1',
  },
  {
    src: 'https://dummyimage.com/80x60',
    alt: 'Image 2',
    width: 80,
    height: 60,
    lazy: false,
    className: 'image-class-2',
  },
  {
    src: 'https://dummyimage.com/80x60',
    alt: 'Image 3',
    width: 80,
    height: 60,
    lazy: true,
    className: 'image-class-3',
  },
];


</script>

<template>
  <div class="flex w-full items-center justify-center">
  <div class="text-center flex flex-col items-center w-full h-full justify-center gap-8 bg-gray-100/80  lg:min-w-[48rem] max-w-6xl px-12">
    <div class="section-size mt-8">
      <MarketingTheHeroSection :title="title" :description="description" />
    </div>
    <div class="section-size">
      <MarketingTheClusterSection :title="title2" :description="description2" :items-images="images" />
    </div>
    <div class="section-size">

      <MarketingTheHeroSectionImage :title="title3" :description="description3" :image="image3" />
    </div>
    <div class="section-size">
      <MarketingTheClusterSectionLeft :description="description2" :items="itemsCluster" />
    </div>
    <div class="section-size">
      <MarketingTheHeroSectionLeftRight :title="title3" descriptionButton="Call to action" />
    </div>
    <div class="section-size">
      <MarketingTheClusterSection :items-images="images" />
    </div>
  </div>
</div>
</template>
<style scoped>

.section-size {
  @apply h-[32rem] w-full;
}

@media (min-width: 768px) {
  .section-size {
    @apply h-fit;
  }
}

@media (min-width: 1024px) {
  .section-size {
    @apply h-fit;;
  }
}

@media (min-width: 1280) {
  .section-size {
    @apply h-[32rem];
  }
}

@media (min-width: 1440px) {
  .section-size {
    @apply h-[36rem];
  }
}

@media (min-width: 2500px) {
  .section-size {
    @apply h-[40rem];
  }
}

</style>