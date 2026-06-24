<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import type { GeoJSONFeatureCollection } from '../types/geojson'
import 'ol/ol.css'

const props = withDefaults(
  defineProps<{
    geojson: GeoJSONFeatureCollection | null
    visible?: boolean
    opacity?: number
  }>(),
  {
    visible: true,
    opacity: 1,
  },
)

const mapContainer = ref<HTMLDivElement | null>(null)
let map: Map | null = null
let vectorLayer: VectorLayer<VectorSource> | null = null

const defaultStyle = new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({ color: 'rgba(33, 150, 243, 0.8)' }),
    stroke: new Stroke({ color: '#ffffff', width: 2 }),
  }),
})

function applyLayerSettings() {
  if (!vectorLayer) {
    return
  }

  vectorLayer.setVisible(props.visible)
  vectorLayer.setOpacity(props.opacity)
}

function updateVectorLayer(geojson: GeoJSONFeatureCollection | null) {
  if (!vectorLayer) {
    return
  }

  const source = vectorLayer.getSource()
  if (!source) {
    return
  }

  source.clear()

  if (!geojson) {
    return
  }

  const features = new GeoJSON().readFeatures(geojson, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857',
  })

  source.addFeatures(features)

  if (features.length > 0 && map) {
    const extent = source.getExtent()
    if (extent && extent.every(Number.isFinite)) {
      map.getView().fit(extent, { padding: [40, 40, 40, 40], maxZoom: 14 })
    }
  }
}

watch(
  () => props.geojson,
  (geojson) => updateVectorLayer(geojson),
)

watch(
  () => [props.visible, props.opacity] as const,
  () => applyLayerSettings(),
)

onMounted(() => {
  if (!mapContainer.value) {
    return
  }

  vectorLayer = new VectorLayer({
    source: new VectorSource(),
    style: defaultStyle,
  })

  map = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      vectorLayer,
    ],
    view: new View({
      center: fromLonLat([37.6173, 55.7558]),
      zoom: 4,
    }),
  })

  applyLayerSettings()
  updateVectorLayer(props.geojson)
})

onUnmounted(() => {
  map?.setTarget(undefined)
  map = null
  vectorLayer = null
})
</script>

<template>
  <div ref="mapContainer" class="map-container" />
</template>
