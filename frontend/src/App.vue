<script setup lang="ts">
import MapView from './components/MapView.vue'
import DropZone from './components/DropZone.vue'
</script>

<template>
  <v-app class="app-shell">
    <div class="app-map">
      <MapView />
      <DropZone />
    </div>
  </v-app>
</template>
