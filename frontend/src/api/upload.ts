import type { GeoJSONFeatureCollection } from '../types/geojson'

interface UploadErrorResponse {
  error?: string
}

export async function uploadCsv(file: File): Promise<GeoJSONFeatureCollection> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/upload', {
    method: 'POST',
    body: formData,
  })

  const payload = (await response.json()) as UploadErrorResponse | GeoJSONFeatureCollection

  if (!response.ok) {
    const errorPayload = payload as UploadErrorResponse
    throw new Error(errorPayload.error ?? 'Failed to upload CSV')
  }

  return payload as GeoJSONFeatureCollection
}
