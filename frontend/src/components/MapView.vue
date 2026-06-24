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
import type { StyleConfig } from '../types/style'
import type { SelectedFeature } from '../types/feature'
import { getIntervalColor } from '../utils/colorScale'
import type { MapBrowserEvent } from 'ol'
import type Feature from 'ol/Feature'
import type { Geometry } from 'ol/geom'
import type { EventsKey } from 'ol/events'
import { listen, unlistenByKey } from 'ol/events'
import 'ol/ol.css'

const emit = defineEmits<{
  'feature-select': [feature: SelectedFeature | null]
}>()

const props = withDefaults(
  defineProps<{
    geojson: GeoJSONFeatureCollection | null
    styleConfig: StyleConfig | null
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
const interactionKeys: EventsKey[] = []

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

function getPropertyRange(property: string) {
  const source = vectorLayer?.getSource()
  if (!source) {
    return null
  }

  const values = source
    .getFeatures()
    .map((feature) => Number(feature.get(property)))
    .filter((value) => !Number.isNaN(value))

  if (values.length === 0) {
    return null
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

function applyFeatureStyle() {
  if (!vectorLayer) {
    return
  }

  const config = props.styleConfig
  if (!config) {
    vectorLayer.setStyle(defaultStyle)
    vectorLayer.changed()
    return
  }

  const range = getPropertyRange(config.property)
  if (!range) {
    vectorLayer.setStyle(defaultStyle)
    vectorLayer.changed()
    return
  }

  vectorLayer.setStyle((feature) => {
    const value = Number(feature.get(config.property))

    if (Number.isNaN(value)) {
      return defaultStyle
    }

    const fillColor = getIntervalColor(
      value,
      range.min,
      range.max,
      config.intervals,
      config.startColor,
      config.endColor,
    )

    return new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({ color: '#ffffff', width: 2 }),
      }),
    })
  })

  vectorLayer.changed()
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

  applyFeatureStyle()
}

function getFeatureProperties(feature: Feature<Geometry>) {
  const properties = { ...feature.getProperties() }
  delete properties.geometry
  return properties as Record<string, string | number | boolean | null>
}

function bindMapInteractions() {
  if (!map || !vectorLayer) {
    return
  }

  interactionKeys.push(
    listen(map, 'singleclick', (event) => {
      const mapEvent = event as MapBrowserEvent<PointerEvent>
      const feature = map?.forEachFeatureAtPixel(mapEvent.pixel, (item) => item, {
        layerFilter: (layer) => layer === vectorLayer,
      })

      if (!feature) {
        emit('feature-select', null)
        return
      }

      emit('feature-select', {
        properties: getFeatureProperties(feature as Feature<Geometry>),
        pixel: [mapEvent.pixel[0], mapEvent.pixel[1]],
      })
    }),
  )

  interactionKeys.push(
    listen(map, 'pointermove', (event) => {
      const mapEvent = event as MapBrowserEvent<PointerEvent>

      if (!map) {
        return
      }

      const hit = map.hasFeatureAtPixel(mapEvent.pixel, {
        layerFilter: (layer) => layer === vectorLayer,
      })

      map.getTargetElement().style.cursor = hit ? 'pointer' : ''
    }),
  )
}

function unbindMapInteractions() {
  interactionKeys.forEach(unlistenByKey)
  interactionKeys.length = 0
}

watch(
  () => props.geojson,
  (geojson) => updateVectorLayer(geojson),
)

watch(
  () => props.styleConfig,
  () => applyFeatureStyle(),
  { deep: true },
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
  bindMapInteractions()
})

onUnmounted(() => {
  unbindMapInteractions()
  map?.setTarget(undefined)
  map = null
  vectorLayer = null
})
</script>

<template>
  <div ref="mapContainer" class="map-container" />
</template>
