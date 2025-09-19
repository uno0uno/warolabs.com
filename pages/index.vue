<script setup>
import { HomeIcon, InformationCircleIcon, BriefcaseIcon, Squares2X2Icon, PhoneIcon, ArrowPathRoundedSquareIcon, FireIcon, BoltIcon, BeakerIcon, GlobeAmericasIcon } from '@heroicons/vue/24/outline';

const {
  public: { nameSite, xNameUser, baseUrl },
} = useRuntimeConfig()


definePageMeta({
  layout: 'landing',
});

const title = 'Descubre el poder de la inteligencia artificial. --fácil y para todos';
const description = 'Únete a nuestra comunidad: eventos de inteligencia artificial creados por nuestros ingenieros, para entender la IA de forma sencilla.';
const title2 = 'Vive la experiencia en nuestros eventos de inteligencia artificial';
const description2 = 'Tu espacio para entender la IA y conectar con la comunidad';
const title3 = 'Entiende la inteligencia artificial, sin complicaciones';
const description3 = 'Aprende IA esencial para 2025 en nuestros labs, ideal para principiantes';
const OG_image = 'https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/waro_labs_OG_image.png'

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

const images2 = [
  {
    src: 'https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/Image%207.png',
    alt: 'Image 1',
    width: 300,
    height: 200,
    lazy: true,
    className: 'image-class-1',
  },
  {
    src: 'https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/Image%208.png',
    alt: 'Image 2',
    width: 300,
    height: 200,
    lazy: false,
    className: 'image-class-2',
  },
  {
    src: 'https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/Image%209.png',
    alt: 'Image 3',
    width: 300,
    height: 200,
    lazy: true,
    className: 'image-class-3',
  },
  {
    src: 'https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/Image%2010.png',
    alt: 'Image 1',
    width: 300,
    height: 200,
    lazy: true,
    className: 'image-class-1',
  },
  {
    src: 'https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/Image%2011.png',
    alt: 'Image 2',
    width: 300,
    height: 200,
    lazy: false,
    className: 'image-class-2',
  },
  {
    src: 'https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/landing/Image%2012.png',
    alt: 'Image 3',
    width: 300,
    height: 200,
    lazy: true,
    className: 'image-class-3',
  },
];

const itemsCluster = [
  {
    icon: BoltIcon,
    title: '¿Quieres aplicar la IA a tu día a día?',
    description: 'Nuestros Labs te enseñan a integrar la Inteligencia Artificial con ejemplos prácticos y soluciones reales',
    size: 14,
  },
  {
    icon: GlobeAmericasIcon,
    title: '¿Cómo impactará la IA tu futuro?',
    description: 'Anticipa las tendencias que marcarán el 2025 y más allá, explicadas por líderes de la industria',
    size: 14,
  },
  {
    icon: FireIcon,
    title: '¿Sientes que la IA es "demasiado técnica"?',
    description: 'Rompe esa barrera. Diseñamos nuestros encuentros para que cualquier persona entienda la IA sin complejidad',
    size: 14,
  },
  {
    icon: BeakerIcon,
    title: '¿Buscas más allá de la teoría?',
    description: 'Conecta con una red de mentes curiosas, comparte ideas y aprende en un entorno colaborativo',
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
]

</script>
<template>
  <div class="w-full flex items-center justify-center">
    <div
      class="text-center flex flex-col items-center w-full h-full justify-center gap-4 lg:min-w-[48rem] max-w-6xl lg:px-12 relative z-0">
      <div class="relative section-size mt-2 sm:pt-8">
        <div class="background-plus"></div>
        <MarketingTheHeroSection :title="title" :description="description" />
      </div>
      <div class="relative w-full h-fit py-4 lg:py-12">
        <div class="background-dots-white"></div>
        <MarketingTheClusterSection :title="title2" :description="description2" :items-images="images" />
      </div>
      <div class="relative w-full h-fit py-4 lg:py-12">
        <div class="background-plus"></div>
        <MarketingTheHeroSectionImage :title="title3" :description="description3"
          videoSrc="https://pub-989cb99e332c4f23a93447c9e3727d1d.r2.dev/Bogot%C3%A1_Caf%C3%A9_Programmer_s_Moment.mp4"
          videoAlt="Alternative text for the video" videoWidth="640" videoHeight="360" />
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
        <MarketingTheClusterSection :items-images="images2" />
      </div>
    </div>
  </div>

  <Head>
    <Link rel="canonical" :href="baseUrl" />
    <Title>▷ {{ title }}</Title>
    <Meta name="description" :content="description" />

    <Meta property="og:type" content="website" />
    <Meta property="og:title" :content="`▷ ${title} | ${nameSite}`" />
    <Meta property="og:description" :content="description" />
    <Meta property="og:image" :content="OG_image" />
    <Meta property="og:image:width" content="828" />
    <Meta property="og:image:height" content="450" />
    <Meta property="og:url" :href="baseUrl" />
    <Meta property="og:site_name" :content="`${nameSite}`" />

    <Meta name="twitter:card" content="summary_large_image" />
    <Meta name="twitter:site" :content="xNameUser" />
    <Meta name="twitter:title" :content="`▷ ${title}`" />
    <Meta name="twitter:description" :content="description" />
    <Meta name="twitter:image" :content="OG_image" />
  </Head>
</template>

<style scoped>
/* === EXCEPCIONES DE TIPOGRAFÍA PARA LANDING === */
/* Preservar tamaños personalizados de landing page, no usar design tokens globales */
:deep(.text-xs) { font-size: 0.75rem !important; }
:deep(.text-sm) { font-size: 0.875rem !important; }
:deep(.text-base) { font-size: 1rem !important; }
:deep(.text-lg) { font-size: 1.125rem !important; }
:deep(.text-xl) { font-size: 1.25rem !important; }
:deep(.text-2xl) { font-size: 1.5rem !important; }
:deep(.text-3xl) { font-size: 1.875rem !important; }
:deep(.text-4xl) { font-size: 2.25rem !important; }
:deep(.text-5xl) { font-size: 3rem !important; }
:deep(.text-6xl) { font-size: 3.75rem !important; }
:deep(.text-7xl) { font-size: 4.5rem !important; }

/* Preservar line-heights personalizados */
:deep(.leading-tight) { line-height: 1.25 !important; }
:deep(.leading-snug) { line-height: 1.375 !important; }
:deep(.leading-normal) { line-height: 1.5 !important; }
:deep(.leading-relaxed) { line-height: 1.625 !important; }
:deep(.leading-loose) { line-height: 2 !important; }

/* Preservar font-weights personalizados */
:deep(.font-light) { font-weight: 300 !important; }
:deep(.font-normal) { font-weight: 400 !important; }
:deep(.font-medium) { font-weight: 500 !important; }
:deep(.font-semibold) { font-weight: 600 !important; }
:deep(.font-bold) { font-weight: 700 !important; }

/* Tus estilos scoped permanecen aquí, ya que solo afectan a este componente/página */
.section-size {
  @apply h-[32rem] w-full;
}

@media (max-width: 374px) {
  .section-size {
    @apply h-fit;
  }
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
    @apply h-fit;
    ;
  }
}

@media (min-width: 1280px) {

  /* Corregido de 1280 a 1280px */
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