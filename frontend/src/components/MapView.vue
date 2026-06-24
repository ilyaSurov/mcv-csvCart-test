<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import 'ol/ol.css'

const mapContainer = ref<HTMLDivElement | null>(null)
let map: Map | null = null

onMounted(() => {
  if (!mapContainer.value) {
    return
  }

  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: fromLonLat([37.6173, 55.7558]),
      zoom: 4,
    }),
  })
})

onUnmounted(() => {
  map?.setTarget(undefined)
  map = null
})
</script>

<template>
  <div ref="mapContainer" class="map-container" />
</template>
