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


</script>

<template>
  <div class="text-center flex flex-col items-center w-full h-full justify-center gap-8 bg-blue-100  lg:min-w-[48rem]">
    <MarketingTheHeroSection :title="title" :description="description" />
    <MarketingTheClusterSection :title="title2" :description="description2" :items-images="images" />
    <MarketingTheHeroSectionImage :title="title3" :description="description3" :image="image3" />
    <MarketingTheClusterSectionLeft :description="description2" :items="itemsCluster" />
    <MarketingTheHeroSectionLeftRight :title="title3" descriptionButton="Call to action" />
    <MarketingTheClusterSection :items-images="images" />
  </div>
</template>