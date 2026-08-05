<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  showPhrase?: boolean
}>(), {
  showPhrase: true,
})

const phrases = [
  'Cargando...',
  'Poniendo todo a punto',
  'Buscando lo que pediste',
  'Calentando motores',
  'Casi listos',
]

const currentPhrase = ref(phrases[0])
let phraseTimer: ReturnType<typeof setInterval> | null = null

function startRotation() {
  if (phraseTimer) return
  let i = 0
  phraseTimer = setInterval(() => {
    i = (i + 1) % phrases.length
    currentPhrase.value = phrases[i]
  }, 2400)
}

function stopRotation() {
  if (phraseTimer) {
    clearInterval(phraseTimer)
    phraseTimer = null
  }
}

onMounted(() => {
  if (props.showPhrase) startRotation()
})

onBeforeUnmount(stopRotation)

// dot grid: same shape as warocol TheCustomLoader (6 cols, 18 cells).
const dotValues = [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1]
const dotDelays = dotValues.map(() => `${(Math.random() * 2).toFixed(2)}s`)
</script>

<template>
  <div
    class="flex flex-col items-center gap-6 py-12"
    role="status"
    aria-live="polite"
  >
    <div class="dot-grid" aria-hidden="true">
      <div
        v-for="(val, i) in dotValues"
        :key="i"
        :class="['dot-item', 'font-mono', val === 1 ? 'dot-one' : 'dot-zero']"
        :style="{ animationDelay: dotDelays[i] }"
      >{{ val }}</div>
    </div>

    <p
      v-if="showPhrase"
      :key="currentPhrase"
      class="phrase-text"
    >{{ currentPhrase }}</p>

    <p
      v-else-if="label"
      class="text-sm text-text-body"
    >{{ label }}</p>
  </div>
</template>

<style scoped>
.dot-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 24px;
}

@keyframes flash-one {
  0%   { color: color-mix(in srgb, var(--text-body) 20%, transparent); }
  50%  { color: var(--accent-text); }
}

@keyframes flash-zero {
  0%   { color: color-mix(in srgb, var(--text-body) 20%, transparent); }
  50%  { color: var(--accent-lime); }
}

.dot-item {
  font-size: 16px;
  line-height: 1;
}

.dot-one {
  color: color-mix(in srgb, var(--text-body) 20%, transparent);
  animation: flash-one 0.8s infinite;
}

.dot-zero {
  color: color-mix(in srgb, var(--text-body) 20%, transparent);
  animation: flash-zero 1.2s infinite;
}

@keyframes fade-phrase {
  0%   { opacity: 0; transform: translateY(4px); }
  15%  { opacity: 1; transform: translateY(0); }
  85%  { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-4px); }
}

.phrase-text {
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  animation: fade-phrase 1.8s ease-in-out;
}
</style>
