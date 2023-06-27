<template>
    <div>
        <form class="p-8">
          <div>
            <label for="date" class="block text-gray-700 text-sm font-bold mb-2">Date:</label>
            <input type="date" id="date" class="form-input">
          </div>
          <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
        </form>
      </div>

      <div class="container mx-auto px-4 py-8">
        <div class="prose">
          <div v-html="convertToHTML(markdownText)"></div>
        </div>
      </div>
</template>

<script setup>
import { marked } from 'marked';

const markdownText = '# Título del post\n\nEste es el contenido del post en **Markdown**.\n\n## Subtítulo 1\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Integer placerat velit nec metus lobortis, vitae feugiat ligula lobortis. Mauris in tristique felis.\n\n> Esto es una cita. Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n## Subtítulo 2\n\nA continuación se muestra una imagen:\n\n![Descripción de la imagen](ruta/a/la/imagen.jpg)\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et metus tellus. Phasellus tincidunt feugiat mauris, eget consectetur turpis auctor a.\n\nSubtítulo 3\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et metus tellus. Phasellus tincidunt feugiat mauris, eget consectetur turpis auctor a.\n\n- Elemento de lista 1\n- Elemento de lista 2\n- Elemento de lista 3';

const convertToHTML = (content) => {
  return marked(content);
};

</script>

<style scoped>

</style>