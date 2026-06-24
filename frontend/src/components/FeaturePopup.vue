<script setup lang="ts">
import { computed } from 'vue'
import type { SelectedFeature } from '../types/feature'

const props = defineProps<{
  feature: SelectedFeature
}>()

const emit = defineEmits<{
  close: []
}>()

const propertyEntries = computed(() =>
  Object.entries(props.feature.properties).sort(([left], [right]) =>
    left.localeCompare(right),
  ),
)

const popupStyle = computed(() => ({
  left: `${props.feature.pixel[0]}px`,
  top: `${props.feature.pixel[1]}px`,
}))
</script>

<template>
  <v-card
    class="feature-popup"
    :style="popupStyle"
    elevation="6"
  >
    <v-card-title class="feature-popup__header text-subtitle-2 py-3">
      <span>Feature info</span>
      <v-btn
        icon="mdi-close"
        size="small"
        variant="text"
        aria-label="Close popup"
        @click="emit('close')"
      />
    </v-card-title>

    <v-divider />

    <v-card-text class="feature-popup__content">
      <div
        v-for="[key, value] in propertyEntries"
        :key="key"
        class="feature-popup__row"
      >
        <span class="feature-popup__key">{{ key }}</span>
        <span class="feature-popup__value">{{ value }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>
