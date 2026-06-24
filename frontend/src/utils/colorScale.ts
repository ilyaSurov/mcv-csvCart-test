function normalizeHex(hex: string): string {
  const value = hex.replace('#', '')

  if (value.length === 3) {
    return value.split('').map((char) => char + char).join('')
  }

  return value
}

function hexToRgb(hex: string) {
  const value = normalizeHex(hex)

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (channel: number) =>
    Math.round(channel).toString(16).padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function interpolateColor(
  startColor: string,
  endColor: string,
  ratio: number,
): string {
  const start = hexToRgb(startColor)
  const end = hexToRgb(endColor)
  const t = Math.min(1, Math.max(0, ratio))

  return rgbToHex(
    start.r + (end.r - start.r) * t,
    start.g + (end.g - start.g) * t,
    start.b + (end.b - start.b) * t,
  )
}

export function buildGradientColors(
  intervals: number,
  startColor: string,
  endColor: string,
): string[] {
  return Array.from({ length: intervals }, (_, index) => {
    const ratio = intervals === 1 ? 0 : index / (intervals - 1)
    return interpolateColor(startColor, endColor, ratio)
  })
}

export function getIntervalColor(
  value: number,
  min: number,
  max: number,
  intervals: number,
  startColor: string,
  endColor: string,
): string {
  if (max === min) {
    return interpolateColor(startColor, endColor, 0.5)
  }

  const ratio = (value - min) / (max - min)
  const bucket = Math.min(intervals - 1, Math.floor(ratio * intervals))
  const bucketRatio = intervals === 1 ? 0 : bucket / (intervals - 1)
  const hex = interpolateColor(startColor, endColor, bucketRatio)
  const { r, g, b } = hexToRgb(hex)

  return `rgba(${r}, ${g}, ${b}, 0.85)`
}
