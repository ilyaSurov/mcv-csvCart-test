<script setup lang="ts">
import { ref } from 'vue'
import MapView from './components/MapView.vue'
import DropZone from './components/DropZone.vue'
import LayerPanel from './components/LayerPanel.vue'
import { uploadCsv } from './api/upload'
import type { GeoJSONFeatureCollection } from './types/geojson'

const geojson = ref<GeoJSONFeatureCollection | null>(null)
const layerName = ref('')
const layerVisible = ref(true)
const layerOpacity = ref(1)
const loading = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')

async function handleFileUpload(file: File) {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    snackbarMessage.value = 'Only CSV files are allowed'
    snackbar.value = true
    return
  }

  loading.value = true

  try {
    geojson.value = await uploadCsv(file)
    layerName.value = file.name
    layerVisible.value = true
    layerOpacity.value = 1
  } catch (error) {
    snackbarMessage.value = error instanceof Error ? error.message : 'Upload failed'
    snackbar.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-app class="app-shell">
    <div class="app-map">
      <MapView
        :geojson="geojson"
        :visible="layerVisible"
        :opacity="layerOpacity"
      />

      <DropZone
        v-if="!geojson"
        @file-drop="handleFileUpload"
      />

      <LayerPanel
        v-if="geojson"
        :layer-name="layerName"
        :visible="layerVisible"
        :opacity="layerOpacity"
        @update:visible="layerVisible = $event"
        @update:opacity="layerOpacity = $event"
        @replace-file="handleFileUpload"
      />
    </div>

    <v-overlay
      :model-value="loading"
      class="align-center justify-center"
      persistent
      scrim="rgba(0, 0, 0, 0.35)"
    >
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>

    <v-snackbar v-model="snackbar" color="error" timeout="4000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-app>
</template>
