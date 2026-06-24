<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import MapView from './components/MapView.vue'
import DropZone from './components/DropZone.vue'
import LayerPanel from './components/LayerPanel.vue'
import AnalyticsPanel from './components/AnalyticsPanel.vue'
import FeaturePopup from './components/FeaturePopup.vue'
import { uploadCsv } from './api/upload'
import type { GeoJSONFeatureCollection } from './types/geojson'
import type { StyleConfig } from './types/style'
import type { SelectedFeature } from './types/feature'
import { getNumericProperties } from './utils/geojson'

const geojson = ref<GeoJSONFeatureCollection | null>(null)
const layerName = ref('')
const layerVisible = ref(true)
const layerOpacity = ref(1)
const styleConfig = ref<StyleConfig | null>(null)
const selectedFeature = ref<SelectedFeature | null>(null)
const loading = ref(false)
const snackbar = ref(false)
const snackbarMessage = ref('')

const hasNumericProperties = computed(() => {
  if (!geojson.value) {
    return false
  }

  return getNumericProperties(geojson.value).length > 0
})

function initStyleConfig(data: GeoJSONFeatureCollection) {
  const properties = getNumericProperties(data)

  if (properties.length === 0) {
    styleConfig.value = null
    return
  }

  styleConfig.value = {
    property: properties[0],
    intervals: 5,
    startColor: '#2196F3',
    endColor: '#F44336',
  }
}

watch(geojson, (data) => {
  selectedFeature.value = null

  if (!data) {
    styleConfig.value = null
    return
  }

  initStyleConfig(data)
})

async function handleFileUpload(file: File) {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    snackbarMessage.value = 'Only CSV files are allowed'
    snackbar.value = true
    return
  }

  loading.value = true
  selectedFeature.value = null

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
        :style-config="styleConfig"
        :visible="layerVisible"
        :opacity="layerOpacity"
        @feature-select="selectedFeature = $event"
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

      <AnalyticsPanel
        v-if="geojson && styleConfig && hasNumericProperties"
        v-model="styleConfig"
        :geojson="geojson"
      />

      <FeaturePopup
        v-if="selectedFeature"
        :feature="selectedFeature"
        @close="selectedFeature = null"
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
