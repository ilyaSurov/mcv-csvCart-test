<script setup lang="ts">
import { computed } from 'vue'
import type { GeoJSONFeatureCollection } from '../types/geojson'
import type { StyleConfig } from '../types/style'
import { getNumericProperties } from '../utils/geojson'
import { buildGradientColors } from '../utils/colorScale'

const props = defineProps<{
  geojson: GeoJSONFeatureCollection
  modelValue: StyleConfig
}>()

const emit = defineEmits<{
  'update:modelValue': [value: StyleConfig]
}>()

const numericProperties = computed(() => getNumericProperties(props.geojson))

const gradientColors = computed(() =>
  buildGradientColors(
    props.modelValue.intervals,
    props.modelValue.startColor,
    props.modelValue.endColor,
  ),
)

function updateConfig(patch: Partial<StyleConfig>) {
  emit('update:modelValue', {
    ...props.modelValue,
    ...patch,
  })
}
</script>

<template>
  <v-card class="analytics-panel" elevation="4">
    <v-card-title class="text-subtitle-1 py-3">
      Analytics
    </v-card-title>

    <v-card-text>
      <v-select
        :model-value="modelValue.property"
        :items="numericProperties"
        label="Numeric property"
        density="compact"
        hide-details
        class="mb-4"
        @update:model-value="updateConfig({ property: String($event) })"
      />

      <div class="mb-2 text-caption text-medium-emphasis">
        Intervals: {{ modelValue.intervals }}
      </div>
      <v-slider
        :model-value="modelValue.intervals"
        min="3"
        max="10"
        step="1"
        hide-details
        class="mb-4"
        @update:model-value="updateConfig({ intervals: Number($event) })"
      />

      <div class="analytics-panel__colors mb-4">
        <label class="analytics-panel__color-field">
          <span class="text-caption">Start</span>
          <input
            type="color"
            :value="modelValue.startColor"
            @input="updateConfig({ startColor: ($event.target as HTMLInputElement).value })"
          >
        </label>

        <label class="analytics-panel__color-field">
          <span class="text-caption">End</span>
          <input
            type="color"
            :value="modelValue.endColor"
            @input="updateConfig({ endColor: ($event.target as HTMLInputElement).value })"
          >
        </label>
      </div>

      <div class="analytics-panel__gradient">
        <span
          v-for="(color, index) in gradientColors"
          :key="index"
          class="analytics-panel__gradient-step"
          :style="{ backgroundColor: color }"
        />
      </div>
    </v-card-text>
  </v-card>
</template>
