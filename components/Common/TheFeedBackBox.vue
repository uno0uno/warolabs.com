<script setup>

const props = defineProps({ 
    id: {type: String},
    });

const { id } = toRefs(props);
const toggle = ref(false);
const sended = ref(false);

const comment = ref('');
const emotionEmoji = ref();


async function sendComment (){
  
  const {
  data: response,
  pending,
  refresh,
  execute,
  error,
} = await useAsyncData('send-comment', () => {
  try {
    return $fetch(`/api/articles/newComment`, {
    method: 'POST',
    body: { 
      comment: comment.value,
      emotionEmoji: emotionEmoji.value,
      id: id.value,
      }
  });
  } catch (error) {
    return error;
  }
});
if(toRaw(response.value[0].id)){
  sended.value = true
}
  

}

watchEffect(() => {
  if(emotionEmoji.value){
    toggle.value = true;
  }
})




</script>
<template>
  <div  v-if="sended == false" class="flex flex-col items-left gap-2">
    <blockquote
      class="text-3xl sm:text-4xl font-semibold italic text-slate-900 py-2"
    >
      ¿Te ha resultado 
      <span
        class="
          before:block
          before:absolute
          before:-inset-1
          before:-skew-y-2
          before:bg-slate-900
          relative
          inline-block
        "
      >
        <span class="relative text-white">útil?</span>
      </span>
    </blockquote>

    <div v-if="toggle == false" class="flex gap-2">
      <input
        type="radio"
        name="reaction"
        id="fire"
        class="hidden sm:hidden peer/fire"
        value="fire"
        v-model="emotionEmoji"
      />
      <label
        for="fire"
        class="
          p-3
          rounded-lg
          border
          cursor-pointer
          peer-checked/fire:bg-slate-100
        "
      >
        <LogosThefire class="h-6 w-6 md:h-8 md:w-8 text-slate-900" />
      </label>

      <input
        type="radio"
        name="reaction"
        id="smiling"
        class="hidden sm:hidden peer/smiling"
        value="smiling"
        v-model="emotionEmoji"
      />
      <label
        for="smiling"
        class="
          p-3
          rounded-lg
          border
          cursor-pointer
          peer-checked/smiling:bg-slate-100
        "
      >
        <LogosTheSmiling class="h-6 w-6 md:h-8 md:w-8 text-slate-900" />
      </label>

      <input
        type="radio"
        name="reaction"
        id="nauseated"
        class="hidden sm:hidden peer/nauseated"
        value="nauseated"
        v-model="emotionEmoji"
      />
      <label
        for="nauseated"
        class="
          p-3
          rounded-lg
          border
          cursor-pointer
          peer-checked/nauseated:bg-slate-100
        "
      >
        <LogosTheNauseated class="h-6 w-6 md:h-8 md:w-8 text-slate-900" />
      </label>

      <input
        type="radio"
        name="reaction"
        id="zzz"
        class="hidden sm:hidden peer/zzz"
        value="zzz"
        v-model="emotionEmoji"
      />
      <label
        for="zzz"
        class="
          p-3
          rounded-lg
          border
          cursor-pointer
          peer-checked/zzz:bg-slate-100
        "
      >
        <LogosTheZzz class="h-6 w-6 md:h-8 md:w-8 text-slate-900" />
      </label>
    </div>
    <div v-if="toggle == true" class="flex flex-col gap-2">
      <div class="flex flex-col gap-2">
        <label for="nombre" class="text-xl sm:text-2xl font-normal italic"
          >Tú opinion (opcional)</label
        >
        <textarea id="nombre" class="rounded-md text-gray-700 p-2" v-model="comment" />
                <label for="nombre" class="text-xl sm:text-m font-normal text-slate-600 "
          >No incluyas información personal en tu comentario.</label
        >
      </div>
    <button
    @click = 'sendComment()'
      class="
        flex
        justify-center
        rounded-lg
        text-sm
        font-semibold
        py-2
        px-4
        bg-slate-900
        text-white
        hover:bg-slate-700
        cursor-pointer
      "
    >
      Enviar
    </button>
        </div>
  </div>
    <div v-if="sended == true"  class="flex flex-col items-left gap-2">
    <blockquote
      class="text-3xl sm:text-4xl font-semibold italic text-slate-900 py-2"
    >
      Gracias por tu opinion
    </blockquote>
    </div>
</template>
