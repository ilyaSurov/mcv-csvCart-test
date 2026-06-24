import type { GeoJSONFeatureCollection } from '../types/geojson'

export function getNumericProperties(geojson: GeoJSONFeatureCollection): string[] {
  const properties = new Set<string>()

  for (const feature of geojson.features) {
    for (const [key, value] of Object.entries(feature.properties)) {
      if (isNumericValue(value)) {
        properties.add(key)
      }
    }
  }

  return Array.from(properties).sort()
}

function isNumericValue(value: string | number | null): boolean {
  if (value === null || value === '') {
    return false
  }

  return !Number.isNaN(Number(value))
}

export function getNumericValues(
  geojson: GeoJSONFeatureCollection,
  property: string,
): number[] {
  return geojson.features
    .map((feature) => Number(feature.properties[property]))
    .filter((value) => !Number.isNaN(value))
}
