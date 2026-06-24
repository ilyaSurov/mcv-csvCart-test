<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  'file-drop': [file: File]
}>()

const isDragging = ref(false)

function onDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files.item(0)
  if (!file) {
    return
  }

  emit('file-drop', file)
}
</script>

<template>
  <div
    class="drop-zone"
    :class="{ 'drop-zone--active': isDragging }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <v-icon size="48" class="mb-4">mdi-file-upload-outline</v-icon>
    <p class="text-h6">Drop CSV file here</p>
    <p class="text-body-2 text-medium-emphasis">
      Drag and drop a CSV with lat/lng columns
    </p>
  </div>
</template>
