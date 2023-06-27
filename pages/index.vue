<template>
     <!-- Contenido de tu artículo -->
     <h1>Título del artículo</h1>
     <p>Contenido del artículo...</p>
 
     <!-- Esquema del artículo -->
     <SchemaOrgArticle
       :name="articleTitle"
       :description="articleDescription"
       :image="articleImage"
       :datePublished="articleDatePublished"
       :dateModified="articleDateModified"
       :author="articleAuthor"
     />
  <SchemaOrgDebug />

</template>

<script setup>

const articleTitle = "Título del artículo";
const articleDescription = "Descripción del artículo";
const articleImage = "/path/to/article-image.jpg";
const articleDatePublished = "2023-06-01";
const articleDateModified = "2023-06-15";
const articleAuthor = {
  "@type": "Person",
  name: "Nombre del autor"
};

useServerSeoMeta({
  title: 'My Amazing Site',
  ogTitle: 'My Amazing Site',
  description: 'This is my amazing site, let me tell you all about it.',
  ogDescription: 'This is my amazing site, let me tell you all about it.',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
});

</script>

<style scoped>

</style>
