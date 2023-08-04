<script setup>

const props = defineProps({ 
    id: {type: String},
    });

const { id } = toRefs(props);

const email = ref('');
const comment = ref('');
const emotionEmoji = ref('');

const token = 'eyJhbGciOiJIUzI1NiIsImtpZCI6ImpIa3dZTnJjZ2hhS2pEMWkiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNjkxMTA5MTEwLCJpYXQiOjE2OTExMDU1MTAsImlzcyI6Imh0dHBzOi8va2FucW5lbXBlcWdkZXNldWp5YWsuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjIyMzlhOTNjLWFlOWQtNDZmNy05NTY5LWJmNzZjM2IxMTA3MSIsImVtYWlsIjoiYW5kZXJzb24uZWxlY3Ryb25pY29AZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6e30sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoib3RwIiwidGltZXN0YW1wIjoxNjkxMTA1NTEwfV0sInNlc3Npb25faWQiOiJjYmUyNzRlNi0wMjkxLTRkZjYtODBiYS1hNTQzNzMyZjZjZTgifQ.-qr1leYWmSh13pdjh9i2bwO8u62Q0jjZR9aGFZQFth4';

const refresh_token = 'EFZHCEZPjG3ozYWy7S9Nmw';

async function sendComment (){
  
  const {
  data: response,
  pending,
  refresh,
  execute,
  error,
} = await useAsyncData('send-comment', () => {
  try {
    return $fetch(`/api/articles/newComment?email=${email.value}`, {
    method: 'POST',
    body: { 
      comment: comment.value,
      emotionEmoji: emotionEmoji.value,
      id: id.value,
      jwt: token,
      refreshToken: refresh_token
      }
  });
  } catch (error) {
    return error;
  }
  console.log(response);
});

}


watchEffect(() => console.log(email.value, comment.value, emotionEmoji.value))

</script>
<template>
  <div class="flex flex-col items-left gap-2">
    <blockquote
      class="text-3xl sm:text-4xl font-semibold italic text-slate-900 py-2"
    >
      Escribe un
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
        <span class="relative text-white">comentario</span>
      </span>
    </blockquote>

    <div class="flex gap-2">
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
    <div class="flex flex-col gap-2">
      <div class="flex flex-col gap-1">
        <label for="nombre" class="text-xl sm:text-2xl font-normal italic"
          >Correo electrónico</label
        >
        <input type="email" id="nombre" class="rounded-md text-gray-700 p-2"  v-model="email" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="nombre" class="text-xl sm:text-2xl font-normal italic"
          >Tú opinion</label
        >
        <textarea id="nombre" class="rounded-md text-gray-700 p-2" v-model="comment" />
      </div>
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
</template>
