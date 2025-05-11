<script setup>
import { MarketingTheClusterSectionLeft } from '#components';


definePageMeta({
  layout: 'landing',
});

const title = 'Haga realidad su version de software';
const description = 'Herramientas profesionales creadas pensando en los desarroladores, los equipos y las empresas';
const title2 = 'Disfrute Creando Software';
const description2 = 'Para Desarrolladores';
const title3 = 'this is the description from tyhe hero here';
const description3 = 'description from the hero here';
const image3 =   [{
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
  <div class="text-center flex flex-col items-left w-full h-full justify-left gap-8 bg-blue-100">
    <MarketingTheHeroSection :title="title" :description="description" />
    <MarketingTheClusterSection :title="title2" :description="description2" :items-images="images" />
    <MarketingTheHeroSectionImage :title="title3" :description="description3" :image="image3" />
    <MarketingTheClusterSectionLeft :description="description2" :items-images="images4" />
    <MarketingTheHeroSectionLeftRight :title="title3" descriptionButton="Call to action" />
    <MarketingTheHeroSectionLeftRight :title="title3" :description="description3" />
    <MarketingTheClusterSection :items-images="images" />
  </div>
</template>