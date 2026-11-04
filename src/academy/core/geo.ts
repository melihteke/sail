import { toRad } from './units'
import type { Vec2 } from './vec'

export interface LatLon {
  lat: number
  lon: number
}

const EARTH_RADIUS_M = 6_371_000

/**
 * Local equirectangular projection around an origin. Accurate to well below a metre
 * over the few-kilometre areas used by the games, and keeps physics in plain metres
 * instead of raw degrees.
 */
export class LocalProjection {
  readonly origin: LatLon
  private readonly cosLat: number

  constructor(origin: LatLon) {
    this.origin = origin
    this.cosLat = Math.cos(toRad(origin.lat))
  }

  toLocal(p: LatLon): Vec2 {
    return {
      x: toRad(p.lon - this.origin.lon) * EARTH_RADIUS_M * this.cosLat,
      y: toRad(p.lat - this.origin.lat) * EARTH_RADIUS_M,
    }
  }

  toLatLon(v: Vec2): LatLon {
    return {
      lat: this.origin.lat + (v.y / EARTH_RADIUS_M) * (180 / Math.PI),
      lon: this.origin.lon + (v.x / (EARTH_RADIUS_M * this.cosLat)) * (180 / Math.PI),
    }
  }
}
