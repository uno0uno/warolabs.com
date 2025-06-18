<script setup>
import { HomeIcon, InformationCircleIcon, BriefcaseIcon, Squares2X2Icon, PhoneIcon } from '@heroicons/vue/24/outline';


definePageMeta({
  layout: 'landing',
});

const title = 'Descubre el poder de la inteligencia artificial. fácil y para todos';
const description = 'Únete a nuestra comunidad y participa en discusiones mensuales sobre cómo la IA está transformando nuestro mundo. --sin tecnicismos, solo ideas claras';
const title2 = 'Vive la experiencia en nuestros eventos de IA';
const description2 = 'Desentrañamos un tema clave de la IA en un lenguaje sencillo';
const title3 = 'Da el primer paso para entender la inteligencia artificial';
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
    src: 'https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/Image%201.png',
    alt: 'Image 1',
    width: 300,
    height: 200,
    lazy: true,
    className: 'image-class-1',
  },
  {
    src: 'https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/Image%202.png',
    alt: 'Image 2',
    width: 300,
    height: 200,
    lazy: false,
    className: 'image-class-2',
  },
  {
    src: 'https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/Image%203.png',
    alt: 'Image 3',
    width: 300,
    height: 200,
    lazy: true,
    className: 'image-class-3',
  },
  {
    src: 'https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/Image%204.png',
    alt: 'Image 1',
    width: 300,
    height: 200,
    lazy: true,
    className: 'image-class-1',
  },
  {
    src: 'https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/Image%205.png',
    alt: 'Image 2',
    width: 300,
    height: 200,
    lazy: false,
    className: 'image-class-2',
  },
  {
    src: 'https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/Image%206.png',
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
  }
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
  <div class="w-full flex items-center justify-center">
    <div class="text-center flex flex-col items-center w-full h-full justify-center gap-6 lg:min-w-[48rem] max-w-6xl lg:px-12 relative z-0">
      <div class="relative section-size mt-8">
        <div class="background-plus"></div>
        <MarketingTheHeroSection :title="title" :description="description" />
      </div>
      <div class="relative w-full h-fit py-4 lg:py-12">
        <div class="background-dots-white"></div>
        <MarketingTheClusterSection :title="title2" :description="description2" :items-images="images" />
      </div>
      <div class="relative w-full h-fit py-4 lg:py-12">
        <div class="background-plus"></div>
          <MarketingTheHeroSectionImage
            :title="title3" 
            :description="description3"
            videoSrc="https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/Bogot%C3%A1_Caf%C3%A9_Programmer_s_Moment.mp4"
            videoAlt="Alternative text for the video"
            videoWidth="640"
            videoHeight="360"
          />
      </div>
      <div class="relative w-full h-fit py-4 lg:py-12">
        <div class="background-dots-white"></div>
        <MarketingTheClusterSectionLeft :description="description2" :items="itemsCluster" />
      </div>
      <div class="relative w-full h-fit py-4 lg:py-12">
        <div class="background-plus"></div>
        <MarketingTheHeroSectionLeftRight :title="title3" descriptionButton="Call to action" />
      </div>
      <div class="relative w-full h-fit py-4 lg:py-12">
        <div class="background-dots-white"></div>
        <MarketingTheClusterSection :items-images="images" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tus estilos scoped permanecen aquí, ya que solo afectan a este componente/página */
.section-size {
  @apply h-[32rem] w-full;
}

@media (min-width: 375px) {
  .section-size {
    @apply h-fit;
  }
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

@media (min-width: 1280px) { /* Corregido de 1280 a 1280px */
  .section-size {
    @apply h-[32rem];
  }
}

@media (min-width: 1440px) {
  .section-size {
    @apply h-[32rem];
  }
}

@media (min-width: 2500px) {
  .section-size {
    @apply h-[40rem];
  }
}
</style>