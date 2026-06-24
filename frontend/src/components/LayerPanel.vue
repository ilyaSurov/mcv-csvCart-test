<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  layerName: string
  visible: boolean
  opacity: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:opacity': [value: number]
  'replace-file': [file: File]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

function openFileDialog() {
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.item(0)

  if (file) {
    emit('replace-file', file)
  }

  input.value = ''
}
</script>

<template>
  <v-card class="layer-panel" elevation="4">
    <v-card-title class="text-subtitle-1 py-3">
      Layer
    </v-card-title>

    <v-card-text>
      <p class="layer-panel__name text-body-2 mb-3">
        {{ layerName }}
      </p>

      <v-checkbox
        :model-value="visible"
        label="Visible"
        density="compact"
        hide-details
        @update:model-value="emit('update:visible', Boolean($event))"
      />

      <div class="mt-2">
        <label class="text-caption text-medium-emphasis">
          Opacity: {{ opacity.toFixed(2) }}
        </label>
        <v-slider
          :model-value="opacity"
          min="0"
          max="1"
          step="0.05"
          hide-details
          @update:model-value="emit('update:opacity', Number($event))"
        />
      </div>

      <v-btn
        size="small"
        variant="tonal"
        class="mt-3"
        block
        @click="openFileDialog"
      >
        Replace CSV
      </v-btn>

      <input
        ref="fileInput"
        type="file"
        accept=".csv"
        hidden
        @change="onFileChange"
      >
    </v-card-text>
  </v-card>
</template>
