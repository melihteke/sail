import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useI18n } from '../../i18n'
import { ARC_R, EYE, HORIZON_MIRROR, HORIZON_NORMAL, PIVOT, arcPoints, poseFor, reflect, type V2 } from './geometry'
import { Telescope } from './telescope'

const Z_OPTICS = 0.16
const Z_CLEAR = 0.32
const SUN_DIST = 7

const v3 = (p: V2, z = Z_OPTICS) => new THREE.Vector3(p.x, p.y, z)
const angleOf = (v: V2) => Math.atan2(v.y, v.x)

function line(color: number, dashed = false): THREE.Line {
  const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])
  const mat = dashed
    ? new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08, transparent: true, opacity: 0.8 })
    : new THREE.LineBasicMaterial({ color })
  return new THREE.Line(geo, mat)
}

function setLine(l: THREE.Line, pts: THREE.Vector3[], visible = true) {
  l.visible = visible
  if (!visible) return
  l.geometry.setFromPoints(pts)
  if (l.material instanceof THREE.LineDashedMaterial) l.computeLineDistances()
}

interface SceneApi {
  update: (reading: number, sunAlt: number) => void
  resetView: () => void
  dispose: () => void
}

function buildScene(host: HTMLDivElement): SceneApi {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  host.appendChild(renderer.domElement)
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#bfe3f7')
  scene.fog = new THREE.Fog('#bfe3f7', 10, 30)

  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 100)
  const home = { pos: new THREE.Vector3(-1.6, 0.9, 5.2), target: new THREE.Vector3(0.1, -0.35, 0) }
  camera.position.copy(home.pos)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(home.target)
  controls.enablePan = false
  controls.minDistance = 2.5
  controls.maxDistance = 10
  controls.enableDamping = true

  scene.add(new THREE.HemisphereLight('#ffffff', '#335577', 1.4))
  const sunLight = new THREE.DirectionalLight('#fff4d6', 2)
  scene.add(sunLight)

  // Sea with a visible horizon far ahead (+x).
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: '#1d5f8c', roughness: 0.6 }))
  sea.rotation.x = -Math.PI / 2
  sea.position.set(20, -2.4, 0)
  scene.add(sea)

  const brass = new THREE.MeshStandardMaterial({ color: '#b08d57', metalness: 0.7, roughness: 0.35 })
  const dark = new THREE.MeshStandardMaterial({ color: '#1f2937', metalness: 0.4, roughness: 0.5 })
  const silver = new THREE.MeshStandardMaterial({ color: '#e5e7eb', metalness: 1, roughness: 0.08 })
  const glass = new THREE.MeshStandardMaterial({ color: '#bae6fd', transparent: true, opacity: 0.25, roughness: 0 })
  const wood = new THREE.MeshStandardMaterial({ color: '#7c4a21', roughness: 0.8 })

  // Frame: a sector from the pivot down to the arc, with a cut-out.
  const ARC_FROM = -6
  const ARC_TO = 62
  const outer = arcPoints(ARC_FROM, ARC_TO, 48, ARC_R + 0.1)
  const shape = new THREE.Shape()
  shape.moveTo(PIVOT.x, PIVOT.y + 0.12)
  outer.forEach((p) => shape.lineTo(p.x, p.y))
  shape.lineTo(PIVOT.x, PIVOT.y + 0.12)
  const hole = new THREE.Path()
  const inner = arcPoints(ARC_FROM + 8, ARC_TO - 8, 32, ARC_R - 0.28)
  const h0 = arcPoints(ARC_FROM + 12, ARC_FROM + 12, 1, 0.55)[0]
  hole.moveTo(h0.x, h0.y)
  inner.forEach((p) => hole.lineTo(p.x, p.y))
  const h1 = arcPoints(ARC_TO - 12, ARC_TO - 12, 1, 0.55)[0]
  hole.lineTo(h1.x, h1.y)
  shape.holes.push(hole)
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 1 }), dark)
  frame.position.z = -0.025
  scene.add(frame)

  // Arc scale with ticks every 5° of reading (2.5° of arm), longer every 10°.
  const arc = new THREE.Mesh(
    new THREE.ExtrudeGeometry(
      (() => {
        const s = new THREE.Shape()
        const o = arcPoints(ARC_FROM, ARC_TO, 48, ARC_R + 0.1)
        const i = arcPoints(ARC_TO, ARC_FROM, 48, ARC_R - 0.06)
        s.moveTo(o[0].x, o[0].y)
        o.forEach((p) => s.lineTo(p.x, p.y))
        i.forEach((p) => s.lineTo(p.x, p.y))
        return s
      })(),
      { depth: 0.02, bevelEnabled: false },
    ),
    brass,
  )
  arc.position.z = 0.03
  scene.add(arc)
  for (let reading = -10; reading <= 120; reading += 5) {
    const long = reading % 10 === 0
    const [a, b] = [arcPoints(reading / 2, reading / 2, 1, ARC_R + 0.09)[0], arcPoints(reading / 2, reading / 2, 1, ARC_R + (long ? -0.04 : 0.02))[0]]
    const tick = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(a.x - b.x, a.y - b.y), 0.008, 0.01), new THREE.MeshBasicMaterial({ color: '#111827' }))
    tick.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, 0.055)
    tick.rotation.z = Math.atan2(a.y - b.y, a.x - b.x)
    scene.add(tick)
  }

  // Index arm (rotates about the pivot) with index mirror and micrometer drum.
  const arm = new THREE.Group()
  const armLen = ARC_R + 0.1
  const armBar = new THREE.Mesh(new THREE.BoxGeometry(0.09, armLen, 0.03), brass)
  armBar.position.set(0, -armLen / 2, 0.075)
  arm.add(armBar)
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.07, 32), brass)
  drum.rotation.x = Math.PI / 2
  drum.position.set(0.14, -armLen + 0.02, 0.1)
  arm.add(drum)
  scene.add(arm)

  const indexMirror = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.34, 0.3), silver)
  indexMirror.position.set(PIVOT.x, PIVOT.y, Z_OPTICS)
  scene.add(indexMirror)
  const pivotCap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 24), brass)
  pivotCap.rotation.x = Math.PI / 2
  pivotCap.position.set(PIVOT.x, PIVOT.y, 0.06)
  scene.add(pivotCap)

  // Horizon mirror: silvered half (near the frame) and clear half.
  const hmAngle = angleOf(HORIZON_NORMAL)
  const hmSilver = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.22, 0.16), silver)
  hmSilver.position.copy(v3(HORIZON_MIRROR, Z_OPTICS))
  hmSilver.rotation.z = hmAngle
  scene.add(hmSilver)
  const hmClear = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.22, 0.16), glass)
  hmClear.position.copy(v3(HORIZON_MIRROR, Z_CLEAR))
  hmClear.rotation.z = hmAngle
  scene.add(hmClear)

  // Shades (sun filters) between the mirrors.
  const shadeMat = new THREE.MeshStandardMaterial({ color: '#b45309', transparent: true, opacity: 0.45 })
  const shadeAt = { x: (PIVOT.x + HORIZON_MIRROR.x) / 2 + 0.06, y: (PIVOT.y + HORIZON_MIRROR.y) / 2 }
  for (const dz of [-0.06, 0]) {
    const shade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.012, 0.18), shadeMat)
    shade.position.set(shadeAt.x, shadeAt.y + dz, Z_OPTICS)
    shade.rotation.z = Math.atan2(HORIZON_MIRROR.y - PIVOT.y, HORIZON_MIRROR.x - PIVOT.x) + Math.PI / 2
    scene.add(shade)
  }

  // Telescope looking at the horizon (+x), and the handle on the back.
  const scopeLen = HORIZON_MIRROR.x - 0.1 - EYE.x
  const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, scopeLen, 24), dark)
  scope.rotation.z = Math.PI / 2
  scope.position.set(EYE.x + scopeLen / 2, EYE.y, (Z_OPTICS + Z_CLEAR) / 2)
  scene.add(scope)
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.75, 16), wood)
  handle.position.set(0.45, -0.75, -0.2)
  handle.rotation.z = -0.35
  scene.add(handle)

  const eyeMark = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({ color: '#0ea5e9' }))
  eyeMark.position.copy(v3(EYE, (Z_OPTICS + Z_CLEAR) / 2))
  scene.add(eyeMark)

  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), new THREE.MeshBasicMaterial({ color: '#fb923c' }))
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), new THREE.MeshBasicMaterial({ color: '#fde68a', transparent: true, opacity: 0.35 }))
  sun.add(glow)
  scene.add(sun)

  const sunRay = line(0xf59e0b)
  const reflectedRay = line(0xf97316)
  const toEyeRay = line(0xf97316)
  const horizonRay = line(0x0284c7)
  const sightLine = line(0xffffff, true)
  scene.add(sunRay, reflectedRay, toEyeRay, horizonRay, sightLine)

  const resize = () => {
    const w = host.clientWidth
    const h = host.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / Math.max(1, h)
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  resize()

  let raf = 0
  const loop = () => {
    controls.update()
    renderer.render(scene, camera)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)

  return {
    update(reading, sunAlt) {
      const pose = poseFor(reading)
      // The bar is modelled pointing down (−y); turn it onto the arm direction.
      arm.rotation.z = angleOf(pose.armDir) + Math.PI / 2
      indexMirror.rotation.z = angleOf(pose.indexNormal)

      const sunDir: V2 = { x: Math.cos((sunAlt * Math.PI) / 180), y: Math.sin((sunAlt * Math.PI) / 180) }
      const sunPos = new THREE.Vector3(PIVOT.x + sunDir.x * SUN_DIST, PIVOT.y + sunDir.y * SUN_DIST, Z_OPTICS)
      sun.position.copy(sunPos)
      sunLight.position.copy(sunPos)

      // Real reflection of the sun's light on the index mirror.
      const travel: V2 = { x: -sunDir.x, y: -sunDir.y }
      const out = reflect(travel, pose.indexNormal)
      const pIndex = v3(PIVOT)
      const pHm = v3(HORIZON_MIRROR)
      const aligned = Math.abs(reading - sunAlt) < 0.75
      setLine(sunRay, [sunPos, pIndex])
      setLine(reflectedRay, [pIndex, aligned ? pHm : new THREE.Vector3(PIVOT.x + out.x * 1.6, PIVOT.y + out.y * 1.6, Z_OPTICS)])
      setLine(toEyeRay, [pHm, v3(EYE)], aligned)
      setLine(horizonRay, [new THREE.Vector3(14, EYE.y, Z_CLEAR), v3(EYE, Z_CLEAR)])
      setLine(sightLine, [pIndex, new THREE.Vector3(PIVOT.x + pose.skyDir.x * SUN_DIST, PIVOT.y + pose.skyDir.y * SUN_DIST, Z_OPTICS)])
    },
    resetView() {
      camera.position.copy(home.pos)
      controls.target.copy(home.target)
    },
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Line) {
          o.geometry.dispose()
          const m = o.material as THREE.Material | THREE.Material[]
          ;(Array.isArray(m) ? m : [m]).forEach((x) => x.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}

export default function Sextant3D() {
  const { t } = useI18n()
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<SceneApi | null>(null)
  const [reading, setReading] = useState(0)
  const [sunAlt, setSunAlt] = useState(35)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!host.current) return
    try {
      api.current = buildScene(host.current)
    } catch {
      setFailed(true)
    }
    return () => {
      api.current?.dispose()
      api.current = null
    }
  }, [])

  useEffect(() => {
    api.current?.update(reading, sunAlt)
  }, [reading, sunAlt])

  // "Play": sweep the arm from 0 up to the sun, like bringing the sun down to the horizon.
  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      let done = false
      setReading((r) => {
        const next = Math.min(sunAlt, r + dt * 12)
        if (next >= sunAlt) done = true
        return next
      })
      if (done) setPlaying(false)
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, sunAlt])

  const err = (sunAlt - reading) * 60
  const aligned = Math.abs(reading - sunAlt) < 0.75
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-300">{t('cn.3d.intro')}</p>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
          <div ref={host} className="aspect-[16/10] w-full cursor-grab active:cursor-grabbing" aria-label={t('cn.3d.canvas')} role="img" />
          {failed && <p className="absolute inset-0 grid place-items-center bg-white/90 p-4 text-sm">{t('cn.3d.noWebgl')}</p>}
          <p className="pointer-events-none absolute left-2 top-2 rounded bg-white/80 px-2 py-0.5 text-xs text-slate-700">{t('cn.3d.drag')}</p>
          <div className="pointer-events-none absolute bottom-2 left-2 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded bg-white/85 px-1.5 py-0.5 text-amber-700">━ {t('cn.3d.legendSun')}</span>
            <span className="rounded bg-white/85 px-1.5 py-0.5 text-sky-700">━ {t('cn.3d.legendHorizon')}</span>
            <span className="rounded bg-white/85 px-1.5 py-0.5 text-slate-700">┅ {t('cn.3d.legendSight')}</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-center">
            <Telescope errMin={err} rock={0} t={t} className="h-56 w-56" />
          </div>
          <p className={`rounded-lg p-2 text-center text-sm font-medium ${aligned ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300'}`}>
            {aligned ? t('cn.3d.aligned') : reading < sunAlt ? t('cn.3d.moveForward') : t('cn.3d.moveBack')}
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-navy-900/60">
          <label className="block text-sm">
            <span className="flex justify-between">
              <span>{t('cn.3d.arm')}</span>
              <span className="font-mono">{(reading / 2).toFixed(1)}°</span>
            </span>
            <input type="range" min={0} max={120} step={0.1} value={reading} onChange={(e) => setReading(Number(e.target.value))} className="w-full accent-sea-500" />
          </label>
          <label className="block text-sm">
            <span className="flex justify-between">
              <span>{t('cn.3d.sunAlt')}</span>
              <span className="font-mono">{sunAlt}°</span>
            </span>
            <input type="range" min={5} max={85} value={sunAlt} onChange={(e) => setSunAlt(Number(e.target.value))} className="w-full accent-amber-500" />
          </label>
          <p className="font-mono text-sm">
            {t('cn.3d.readingIs', { arm: (reading / 2).toFixed(1), reading: reading.toFixed(1) })}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setReading(0)
                setPlaying(true)
              }}
            >
              ▶ {t('cn.3d.play')}
            </button>
            <button type="button" className="btn-secondary" onClick={() => api.current?.resetView()}>
              ⟲ {t('cn.3d.resetView')}
            </button>
          </div>
        </div>
        <ol className="list-decimal space-y-1.5 rounded-xl border border-slate-200 bg-white p-4 pl-8 text-sm dark:border-white/10 dark:bg-navy-900/60">
          {(['1', '2', '3', '4', '5'] as const).map((k) => (
            <li key={k}>{t(`cn.3d.step${k}`)}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}
