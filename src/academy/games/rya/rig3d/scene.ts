import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { CONTROL_IDS, CONTROL_PARTS, ROPE_COLORS, rigState, type ControlId, type Controls, type PartId, type RigState } from './rigModel'

export const VIEW_IDS = ['side', 'stern', 'bow', 'top', 'cockpit'] as const
export type ViewId = (typeof VIEW_IDS)[number]

export const PART_LABELS = ['mast', 'boom', 'mainsail', 'jib', 'forestay', 'backstay', 'shroud', 'spreader', 'gooseneck', 'winch', 'jammer', 'cockpit', 'bow', 'stern'] as const
export type PartLabel = (typeof PART_LABELS)[number]

export interface LabelTexts {
  controls: Record<ControlId, string>
  parts: Record<PartLabel, string>
}

export interface RigSceneApi {
  setControls: (c: Controls, instant?: boolean) => void
  setWind: (angle: number, fromStarboard: boolean) => void
  setSelected: (id: ControlId | null) => void
  setView: (v: ViewId) => void
  setLabels: (texts: LabelTexts) => void
  setLabelMode: (lines: boolean, parts: boolean) => void
  dispose: () => void
}

type V3 = THREE.Vector3
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const DEG = Math.PI / 180
const UP = v(0, 1, 0)
const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

/* Boat frame: x = forward, y = up, z = starboard. */
const MAST_X = 1.2
const MAST_TOP = 13.6
const MASTHEAD = v(MAST_X + 0.02, MAST_TOP - 0.12, 0)
const GOOSENECK = v(MAST_X - 0.15, 2.3, 0)
const BOOM_LEN = 4.7
const LUFF = 10.9
const JIB_TACK = v(4.75, 1.2, 0)
const STAY_TOP = v(MAST_X + 0.05, 12.8, 0)
const JIB_HEAD = JIB_TACK.clone().lerp(STAY_TOP, 0.85)
const TRAV_X = -2.6
const TRAV_Y = 1.3
const JAMMER_X = -0.95

const VIEWS: Record<ViewId, { pos: V3; target: V3 }> = {
  side: { pos: v(0.5, 6.9, 20.5), target: v(0, 6.2, 0) },
  stern: { pos: v(-16.5, 6.5, 3.5), target: v(0, 5.2, 0) },
  bow: { pos: v(15.5, 6, -4.5), target: v(0, 5.2, 0) },
  top: { pos: v(-4, 22, 7), target: v(-0.5, 2.5, 0) },
  cockpit: { pos: v(-7.6, 4.1, 3.4), target: v(0.3, 3.4, 0) },
}

function halfBeam(x: number): number {
  const f = (x + 5) / 10
  return f < 0.55 ? 1.35 + 0.35 * Math.sin(((f / 0.55) * Math.PI) / 2) : 1.7 * Math.pow(Math.max(0, Math.cos((((f - 0.55) / 0.45) * Math.PI) / 2)), 0.9) + 0.02
}
function deckY(x: number): number {
  const f = (x + 5) / 10
  return 1.0 + 0.2 * f * f
}

function hullGeometry(): THREE.BufferGeometry {
  const NX = 40
  const NS = 16
  const pos: number[] = []
  const idx: number[] = []
  for (let i = 0; i <= NX; i++) {
    const x = -5 + (10 * i) / NX
    const f = i / NX
    const half = halfBeam(x)
    const depth = 0.8 + 0.55 * Math.sin((Math.min(1, f / 0.6) * Math.PI) / 2) - (f > 0.85 ? ((f - 0.85) / 0.15) * 0.5 : 0)
    const top = deckY(x)
    for (let j = 0; j <= NS; j++) {
      const s = -Math.PI / 2 + (Math.PI * j) / NS
      pos.push(x, top - depth * Math.pow(Math.max(0, Math.cos(s)), 1.3), half * Math.sin(s))
    }
  }
  for (let i = 0; i < NX; i++)
    for (let j = 0; j < NS; j++) {
      const a = i * (NS + 1) + j
      const b = a + NS + 1
      idx.push(a, b, a + 1, a + 1, b, b + 1)
    }
  // Transom: a fan from the deck centre at the stern.
  const c = pos.length / 3
  pos.push(-5, deckY(-5), 0)
  for (let j = 0; j < NS; j++) idx.push(c, j, j + 1)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function deckGeometry(): THREE.BufferGeometry {
  const NX = 40
  const pos: number[] = []
  const idx: number[] = []
  for (let i = 0; i <= NX; i++) {
    const x = -5 + (10 * i) / NX
    const h = halfBeam(x)
    pos.push(x, deckY(x) + 0.005, -h, x, deckY(x) + 0.005, h)
    if (i < NX) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

function sailMesh(nu: number, nv: number, mat: THREE.Material): THREE.Mesh {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((nu + 1) * (nv + 1) * 3), 3))
  const idx: number[] = []
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i
      const c = a + nu + 1
      idx.push(a, c, a + 1, a + 1, c, c + 1)
    }
  g.setIndex(idx)
  const m = new THREE.Mesh(g, mat)
  m.userData = { nu, nv }
  return m
}

/** Shapes a sail between its luff (l0→l1) and leech (r0→r1), with camber to leeward, twist and flutter. */
function fillSail(mesh: THREE.Mesh, l0: V3, l1: V3, r0: V3, r1: V3, o: { draft: number; lee: number; twist: number; flutter: number; time: number }) {
  const { nu, nv } = mesh.userData as { nu: number; nv: number }
  const attr = mesh.geometry.getAttribute('position') as THREE.BufferAttribute
  const L = new THREE.Vector3()
  const R = new THREE.Vector3()
  const c = new THREE.Vector3()
  const n = new THREE.Vector3()
  const p = new THREE.Vector3()
  for (let j = 0; j <= nv; j++) {
    const fv = j / nv
    L.lerpVectors(l0, l1, fv)
    R.lerpVectors(r0, r1, fv)
    c.subVectors(R, L)
    c.applyAxisAngle(UP, o.lee * o.twist * fv * DEG)
    const len = c.length()
    n.crossVectors(c, UP)
    if (n.lengthSq() > 1e-8) n.normalize().multiplyScalar(-o.lee)
    for (let i = 0; i <= nu; i++) {
      const u = i / nu
      const bulge = o.draft * len * 4 * u * (1 - u) * (1 - o.flutter * 0.85)
      const flap = o.flutter * len * 0.12 * Math.sin(Math.PI * u) * Math.sin(o.time * 10 - u * 6 + fv * 3)
      p.copy(L).addScaledVector(c, u).addScaledVector(n, bulge + flap)
      attr.setXYZ(j * (nu + 1) + i, p.x, p.y, p.z)
    }
  }
  attr.needsUpdate = true
  mesh.geometry.computeVertexNormals()
  mesh.geometry.computeBoundingSphere()
}

/** A rope made of one or more pieces; a piece may sag (quadratic curve) between its first two points. */
interface Piece {
  pts: V3[]
  sag?: number
}

class Rope {
  readonly mat: THREE.MeshStandardMaterial
  readonly group = new THREE.Group()
  private meshes: THREE.Mesh[] = []
  radius = 0.03

  constructor(color: string) {
    this.mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, transparent: true })
  }

  set(pieces: Piece[]) {
    pieces.forEach((pc, k) => {
      const path = new THREE.CurvePath<THREE.Vector3>()
      for (let i = 0; i < pc.pts.length - 1; i++) {
        const a = pc.pts[i]
        const b = pc.pts[i + 1]
        if (i === 0 && pc.sag && pc.sag > 0.01) {
          const mid = a.clone().lerp(b, 0.5)
          mid.y -= pc.sag
          path.add(new THREE.QuadraticBezierCurve3(a, mid, b))
        } else path.add(new THREE.LineCurve3(a, b))
      }
      const geo = new THREE.TubeGeometry(path, Math.max(12, pc.pts.length * 14), this.radius, 6, false)
      let mesh = this.meshes[k]
      if (!mesh) {
        mesh = new THREE.Mesh(geo, this.mat)
        this.meshes[k] = mesh
        this.group.add(mesh)
      } else {
        mesh.geometry.dispose()
        mesh.geometry = geo
      }
    })
  }
}

export function buildRigScene(host: HTMLDivElement, onPick: (id: ControlId) => void): RigSceneApi {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  host.appendChild(renderer.domElement)
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' })

  const labelRenderer = new CSS2DRenderer()
  Object.assign(labelRenderer.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' })
  host.appendChild(labelRenderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#cfe8f7')
  scene.fog = new THREE.Fog('#cfe8f7', 40, 110)

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300)
  camera.position.copy(VIEWS.side.pos)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.copy(VIEWS.side.target)
  controls.enablePan = false
  controls.minDistance = 2.5
  controls.maxDistance = 45
  controls.maxPolarAngle = Math.PI * 0.495
  controls.enableDamping = true

  scene.add(new THREE.HemisphereLight('#ffffff', '#3b6e8f', 1.5))
  const sun = new THREE.DirectionalLight('#fff7e0', 1.6)
  sun.position.set(8, 20, 12)
  scene.add(sun)

  const sea = new THREE.Mesh(new THREE.CircleGeometry(150, 64), new THREE.MeshStandardMaterial({ color: '#1f6f9f', roughness: 0.55, transparent: true, opacity: 0.92 }))
  sea.rotation.x = -Math.PI / 2
  sea.position.y = 0.35
  scene.add(sea)

  const boat = new THREE.Group()
  scene.add(boat)

  const hullMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.4, side: THREE.DoubleSide })
  const deckMat = new THREE.MeshStandardMaterial({ color: '#d6c3a1', roughness: 0.9 })
  const greyMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.6, roughness: 0.35 })
  const darkMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6 })
  const wireMat = new THREE.LineBasicMaterial({ color: '#475569' })

  boat.add(new THREE.Mesh(hullGeometry(), hullMat))
  boat.add(new THREE.Mesh(deckGeometry(), deckMat))

  const addBox = (w: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
    m.position.set(x, y, z)
    boat.add(m)
    return m
  }
  addBox(3.6, 0.42, 2.0, 0.8, deckY(0.8) + 0.2, 0, hullMat)
  addBox(2.6, 0.04, 2.0, -2.6, deckY(-2.6) + 0.02, 0, darkMat)
  addBox(0.35, 0.22, 2.3, TRAV_X, TRAV_Y - 0.13, 0, hullMat)
  addBox(0.08, 0.04, 2.3, TRAV_X, TRAV_Y, 0, greyMat)
  addBox(1.3, 1.5, 0.16, 0.2, -0.55, 0, darkMat)
  addBox(0.6, 1.1, 0.08, -4.1, -0.25, 0, darkMat)
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 8, 32), greyMat)
  wheel.position.set(-4.0, deckY(-4) + 0.62, 0)
  wheel.rotation.y = Math.PI / 2
  boat.add(wheel)

  const winch = (x: number, y: number, z: number) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.2, 16), greyMat)
    w.position.set(x, y, z)
    boat.add(w)
  }
  for (const s of [-1, 1]) {
    winch(-2.3, 1.38, s * 1.25)
    winch(-1.2, 1.6, s * 0.75)
  }
  addBox(0.12, 0.08, 1.2, JAMMER_X, 1.53, 0, darkMat)

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, MAST_TOP - 1.0, 16), greyMat)
  mast.position.set(MAST_X, (MAST_TOP + 1.0) / 2, 0)
  boat.add(mast)
  addBox(0.06, 0.05, 1.9, MAST_X - 0.05, 7.6, 0, greyMat)

  const wire = (pts: V3[]) => boat.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat))
  wire([JIB_TACK, STAY_TOP])
  wire([MASTHEAD, v(-4.95, deckY(-4.95) + 0.1, 0)])
  for (const s of [-1, 1]) {
    wire([v(MAST_X, 12.6, 0), v(MAST_X - 0.05, 7.6, s * 0.95), v(MAST_X - 0.25, 1.1, s * 1.58)])
    wire([v(MAST_X, 7.5, 0), v(MAST_X + 0.5, 1.1, s * 1.5)])
    const life: V3[] = []
    for (let x = -4.8; x <= 4.3; x += 0.3) life.push(v(x, deckY(x) + 0.6, s * (halfBeam(x) - 0.08)))
    wire(life)
    for (let x = -4.5; x <= 3.6; x += 1.6) wire([v(x, deckY(x), s * (halfBeam(x) - 0.08)), v(x, deckY(x) + 0.6, s * (halfBeam(x) - 0.08))])
  }

  // Moving parts, each with its own material so it can glow.
  const partMat: Record<PartId, THREE.MeshStandardMaterial> = {
    main: new THREE.MeshStandardMaterial({ color: '#fdfdfd', roughness: 0.85, side: THREE.DoubleSide }),
    jib: new THREE.MeshStandardMaterial({ color: '#fffbeb', roughness: 0.85, side: THREE.DoubleSide }),
    boom: new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.6, roughness: 0.35 }),
    drum: new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5 }),
    car: new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.5 }),
    bundle: new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.9 }),
  }

  const boomGroup = new THREE.Group()
  boomGroup.position.copy(GOOSENECK)
  const boomMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, BOOM_LEN, 12), partMat.boom)
  boomMesh.rotation.z = -Math.PI / 2
  boomMesh.position.x = BOOM_LEN / 2
  boomGroup.add(boomMesh)
  const bundle = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 12), partMat.bundle)
  bundle.rotation.z = -Math.PI / 2
  boomGroup.add(bundle)
  boat.add(boomGroup)

  const main = sailMesh(10, 18, partMat.main)
  const jib = sailMesh(10, 16, partMat.jib)
  boat.add(main, jib)
  const edgeMat = new THREE.LineBasicMaterial({ color: '#64748b' })
  const mainEdge = new THREE.Line(new THREE.BufferGeometry(), edgeMat)
  const jibEdge = new THREE.Line(new THREE.BufferGeometry(), edgeMat)
  boat.add(mainEdge, jibEdge)

  const stayDir = STAY_TOP.clone().sub(JIB_TACK).normalize()
  const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1, 1, 10), partMat.jib)
  roll.quaternion.setFromUnitVectors(UP, stayDir)
  boat.add(roll)
  const drum = new THREE.Group()
  drum.position.copy(JIB_TACK).addScaledVector(stayDir, -0.12)
  drum.quaternion.setFromUnitVectors(UP, stayDir)
  const drumBody = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 16), partMat.drum)
  const drumMark = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.15, 0.04), new THREE.MeshStandardMaterial({ color: '#facc15' }))
  drum.add(drumBody, drumMark)
  boat.add(drum)

  const car = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.22), partMat.car)
  boat.add(car)

  const ropes = Object.fromEntries(CONTROL_IDS.map((id) => [id, new Rope(ROPE_COLORS[id])])) as Record<ControlId, Rope>
  Object.values(ropes).forEach((r) => boat.add(r.group))

  // A few faint wind streaks drifting past.
  const streaks = Array.from({ length: 7 }, (_, i) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 }))
    m.userData = { phase: i / 7, h: 2.5 + ((i * 3.7) % 9), off: ((i * 5.3) % 10) - 5 }
    scene.add(m)
    return m
  })

  // Labels.
  const makeLabel = (cls: string, color?: string) => {
    const el = document.createElement('div')
    el.className = cls
    if (color) el.style.borderColor = color
    const obj = new CSS2DObject(el)
    boat.add(obj)
    return obj
  }
  const lineLabels = Object.fromEntries(
    CONTROL_IDS.map((id) => {
      const o = makeLabel('rig3d-label rig3d-label-line', ROPE_COLORS[id])
      o.element.style.pointerEvents = 'auto'
      o.element.addEventListener('click', () => onPick(id))
      return [id, o]
    }),
  ) as Record<ControlId, CSS2DObject>
  const partLabels = Object.fromEntries(PART_LABELS.map((id) => [id, makeLabel('rig3d-label rig3d-label-part')])) as Record<PartLabel, CSS2DObject>

  let target: Controls | null = null
  let cur: Controls | null = null
  let windAngle = 50
  let windTarget = 50
  let lee = -1
  let selected: ControlId | null = null
  let showLines = true
  let showParts = false
  let heel = 0
  let dirty = true
  let tween: { from: V3; to: V3; tFrom: V3; tTo: V3; t: number } | null = null

  const boomDir = (s: RigState) => {
    const a = s.boomAngle * DEG
    const p = s.boomPitch * DEG
    return v(-Math.cos(a) * Math.cos(p), Math.sin(p), lee * Math.sin(a) * Math.cos(p))
  }

  const tails: Record<string, number> = { halyard: 0.22, topping: 0.42, kicker: 0.62, reef: -0.22, outhaul: -0.42 }
  const toJammer = (id: string): V3[] => {
    const z = tails[id]
    return [v(MAST_X - 0.13, 1.62, z * 0.3), v(MAST_X - 0.35, 1.52, z), v(JAMMER_X + 0.05, 1.56, z), v(-1.2, 1.62, Math.sign(z) * 0.75)]
  }

  const layout = (s: RigState, c: Controls, time: number) => {
    const dir = boomDir(s)
    const boomAt = (d: number) => GOOSENECK.clone().addScaledVector(dir, d)
    boomGroup.quaternion.setFromUnitVectors(v(1, 0, 0), dir)

    // Mainsail.
    const tack = v(MAST_X - 0.12, GOOSENECK.y + 0.06, 0)
    const headPt = v(MAST_X - 0.12, GOOSENECK.y + 0.06 + s.hoist * LUFF, 0)
    const clew = boomAt(BOOM_LEN * s.clew).add(v(0, 0.08, 0))
    const flat = v(dir.x, 0, dir.z).normalize()
    const headLeech = headPt.clone().addScaledVector(flat, 0.2)
    main.visible = s.mainUp
    mainEdge.visible = s.mainUp
    if (s.mainUp) {
      fillSail(main, tack, headPt, clew, headLeech, { draft: s.draft, lee, twist: s.twist, flutter: s.mainLuff, time })
      const pa = main.geometry.getAttribute('position') as THREE.BufferAttribute
      const nu = 10
      const nv = 18
      const at = (i: number, j: number) => v(pa.getX(j * (nu + 1) + i), pa.getY(j * (nu + 1) + i), pa.getZ(j * (nu + 1) + i))
      const loop = [at(0, 0), at(0, nv), ...Array.from({ length: nv + 1 }, (_, j) => at(nu, nv - j)), ...Array.from({ length: nu + 1 }, (_, i) => at(nu - i, 0))]
      mainEdge.geometry.dispose()
      mainEdge.geometry = new THREE.BufferGeometry().setFromPoints(loop)
    }
    const stowed = (1 - c.halyard) * 0.16 + c.reef * 0.08
    bundle.visible = stowed > 0.015
    bundle.scale.set(0.05 + stowed, BOOM_LEN * (0.25 + 0.6 * Math.max(1 - c.halyard, c.reef)), 0.05 + stowed)
    bundle.position.set((BOOM_LEN * (0.25 + 0.6 * Math.max(1 - c.halyard, c.reef))) / 2 + 0.1, 0.1 + stowed * 0.6, 0)

    // Jib.
    const ja = s.jibAngle * DEG * lee
    const clewFull = JIB_TACK.clone().add(v(-4.3, 0.5, 0).applyAxisAngle(UP, ja))
    const luff0 = JIB_TACK.clone().lerp(JIB_HEAD, 0.03)
    const jClew = luff0.clone().lerp(clewFull, s.jibOut)
    jib.visible = s.jibUp
    jibEdge.visible = s.jibUp
    if (s.jibUp) {
      fillSail(jib, luff0, JIB_HEAD, jClew, JIB_HEAD.clone().addScaledVector(v(-1, 0, 0), 0.05), { draft: 0.13, lee, twist: 6, flutter: s.jibLuff, time: time + 1.3 })
      jibEdge.geometry.dispose()
      jibEdge.geometry = new THREE.BufferGeometry().setFromPoints([luff0, JIB_HEAD, jClew, luff0])
    }
    const rollLen = JIB_TACK.distanceTo(JIB_HEAD)
    const rollR = 0.03 + 0.11 * (1 - s.jibOut)
    roll.scale.set(rollR, rollLen, rollR)
    roll.position.copy(JIB_TACK).lerp(JIB_HEAD, 0.5)
    drum.rotation.set(0, 0, 0)
    drum.quaternion.setFromUnitVectors(UP, stayDir)
    drum.rotateY(c.furling * 18)

    // Traveller car.
    const carZ = lee * (0.5 - c.traveller) * 2.1
    const carPt = v(TRAV_X, TRAV_Y + 0.07, carZ)
    car.position.copy(carPt)

    // Ropes.
    const zig = (a: V3, b: V3, parts: number, sag = 0): Piece[] =>
      Array.from({ length: parts }, (_, k) => ({ pts: [a.clone().add(v((k - (parts - 1) / 2) * 0.05, 0, 0)), b.clone().add(v((k - (parts - 1) / 2) * 0.05, 0, 0))], sag }))
    const masthead = MASTHEAD
    ropes.halyard.set([{ pts: [headPt.clone().add(v(0.14, 0, 0)), v(MAST_X + 0.14, MAST_TOP - 0.15, 0)] }, { pts: toJammer('halyard') }])

    const sheetPt = boomAt(BOOM_LEN * 0.86).add(v(0, -0.09, 0))
    ropes.mainsheet.set([...zig(sheetPt, carPt.clone().add(v(0, 0.06, 0)), 4, s.sheetSlack * 0.7), { pts: [carPt.clone().add(v(0.1, 0.05, 0)), v(TRAV_X + 0.4, TRAV_Y + 0.05, carZ * 0.5)] }])

    ropes.traveller.set([
      { pts: [carPt.clone().add(v(0, -0.02, 0.1)), v(TRAV_X, TRAV_Y + 0.05, 1.12), v(TRAV_X + 0.35, TRAV_Y + 0.05, 1.12)] },
      { pts: [carPt.clone().add(v(0, -0.02, -0.1)), v(TRAV_X, TRAV_Y + 0.05, -1.12), v(TRAV_X + 0.35, TRAV_Y + 0.05, -1.12)] },
    ])

    const kickerCap = 12 * (1 - c.kicker)
    const kickerSlack = clamp01((kickerCap - s.boomPitch) / 6) * 0.35
    const kBoom = boomAt(0.95).add(v(0, -0.08, 0))
    const kMast = v(MAST_X - 0.14, 1.62, 0)
    ropes.kicker.set([...zig(kBoom, kMast, 2, kickerSlack), { pts: [kMast.clone(), ...toJammer('kicker').slice(1)] }])

    const boomEnd = boomAt(BOOM_LEN - 0.05)
    const sl = s.toppingSlack
    const tMid = boomEnd.clone().lerp(masthead, 0.5).add(v(-1.6 * sl, -1.2 * sl, 0))
    const topCurve = new THREE.QuadraticBezierCurve3(boomEnd, tMid, masthead)
    ropes.topping.set([{ pts: topCurve.getPoints(16) }, { pts: toJammer('topping') }])

    const under = (d: number) => boomAt(d).add(v(0, -0.1, 0))
    ropes.outhaul.set([{ pts: [clew.clone(), under(BOOM_LEN * s.clew - 0.15), under(0.3), v(MAST_X - 0.13, GOOSENECK.y - 0.1, -0.06), ...toJammer('outhaul')] }])

    const cringle = s.mainUp ? clew.clone().lerp(headLeech, 0.26 * (1 - c.reef)) : clew.clone()
    ropes.reef.set([{ pts: [cringle, under(BOOM_LEN * 0.97), under(0.45), v(MAST_X - 0.13, GOOSENECK.y - 0.12, 0.06), ...toJammer('reef')] }])

    ropes.furling.set([{ pts: [JIB_TACK.clone().addScaledVector(stayDir, -0.12), v(4.3, deckY(4.3) + 0.1, 0.45), v(2.6, deckY(2.6) + 0.1, 1.3), v(-1.6, deckY(-1.6) + 0.12, 1.4), v(-2.1, 1.32, 1.25)] }])

    const car3 = (side: number) => v(-0.3, deckY(-0.3) + 0.08, side * 1.42)
    const winch3 = (side: number) => v(-2.3, 1.42, side * 1.25)
    ropes.jibLee.set([{ pts: [jClew.clone(), car3(lee), winch3(lee)], sag: s.jibLeeSlack * 0.6 }])
    const backed = s.jibAngle < 0
    ropes.jibWind.set([
      { pts: backed ? [jClew.clone(), car3(-lee), winch3(-lee)] : [jClew.clone(), v(MAST_X + 0.45, 1.65, 0), car3(-lee), winch3(-lee)], sag: backed ? 0 : 0.25 + (1 - c.jibWind) * 0.6 },
    ])

    // Label anchors.
    const put = (o: CSS2DObject, p: V3) => o.position.copy(p)
    put(lineLabels.halyard, headPt.clone().lerp(MASTHEAD, 0.35).add(v(0.45, 0, 0)))
    put(lineLabels.mainsheet, sheetPt.clone().lerp(carPt, 0.6))
    put(lineLabels.traveller, carPt.clone().add(v(-0.2, -0.55, 0)))
    put(lineLabels.kicker, kBoom.clone().lerp(kMast, 0.5).add(v(0.25, -0.15, 0)))
    put(lineLabels.topping, topCurve.getPoint(0.6))
    put(lineLabels.outhaul, clew.clone().add(v(-0.5, 0.4, 0)))
    put(lineLabels.reef, cringle.clone().add(v(-0.3, 0.2, 0)))
    put(lineLabels.furling, JIB_TACK.clone().add(v(0.3, -0.3, 0)))
    put(lineLabels.jibLee, jClew.clone().add(v(0, 0.75, 0)))
    put(lineLabels.jibWind, car3(-lee).add(v(-0.4, 0.45, 0)))
    put(partLabels.mast, v(MAST_X + 0.15, 10.2, 0))
    put(partLabels.boom, boomAt(BOOM_LEN * 0.55).add(v(0, 0.25, 0)))
    put(partLabels.mainsail, tack.clone().add(headPt).add(clew).multiplyScalar(1 / 3))
    put(partLabels.jib, luff0.clone().add(JIB_HEAD).add(jClew).multiplyScalar(1 / 3))
    put(partLabels.forestay, JIB_TACK.clone().lerp(STAY_TOP, 0.62).add(v(0.3, 0, 0)))
    put(partLabels.backstay, v(-4.95, 1.2, 0).lerp(MASTHEAD, 0.35))
    put(partLabels.shroud, v(MAST_X - 0.15, 4.6, -lee * 1.3))
    put(partLabels.spreader, v(MAST_X - 0.05, 7.75, -lee * 0.95))
    put(partLabels.gooseneck, GOOSENECK.clone().add(v(0.1, -0.25, 0)))
    put(partLabels.winch, winch3(-lee).add(v(0, 0.25, 0)))
    put(partLabels.jammer, v(JAMMER_X, 1.75, 0))
    put(partLabels.cockpit, v(-3.2, 1.15, 0))
    put(partLabels.bow, v(5.1, 1.9, 0))
    put(partLabels.stern, v(-5.2, 1.6, 0))
  }

  const applyHighlight = (time: number) => {
    const moving = new Set(selected ? CONTROL_PARTS[selected] : [])
    const glow = 0.12 + 0.1 * Math.sin(time * 3)
    for (const [id, mat] of Object.entries(partMat) as [PartId, THREE.MeshStandardMaterial][]) {
      mat.emissive.set(moving.has(id) ? '#f59e0b' : '#000000')
      mat.emissiveIntensity = moving.has(id) ? glow : 0
    }
    for (const id of CONTROL_IDS) {
      const r = ropes[id]
      const on = selected === id
      r.mat.opacity = selected && !on ? 0.3 : 1
      r.mat.emissive.set(on ? ROPE_COLORS[id] : '#000000')
      r.mat.emissiveIntensity = on ? 0.35 + 0.25 * Math.sin(time * 4) : 0
      lineLabels[id].element.classList.toggle('is-selected', on)
      lineLabels[id].element.classList.toggle('is-dim', !!selected && !on)
    }
  }

  const setRopeRadius = () => {
    for (const id of CONTROL_IDS) ropes[id].radius = selected === id ? 0.045 : 0.03
    dirty = true
  }

  const resize = () => {
    const w = host.clientWidth
    const h = host.clientHeight
    renderer.setSize(w, h, false)
    labelRenderer.setSize(w, h)
    camera.aspect = w / Math.max(1, h)
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  resize()

  let raf = 0
  let last = performance.now()
  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const time = now / 1000
    if (target && cur) {
      const k = Math.min(1, dt * 5)
      for (const id of CONTROL_IDS) {
        const d = target[id] - cur[id]
        if (Math.abs(d) > 1e-4) {
          cur[id] += d * k
          dirty = true
        } else cur[id] = target[id]
      }
      if (Math.abs(windTarget - windAngle) > 0.01) {
        windAngle += (windTarget - windAngle) * k
        dirty = true
      }
      const s = rigState(cur, windAngle)
      if (dirty || s.mainLuff > 0.01 || s.jibLuff > 0.01) layout(s, cur, time)
      dirty = false
      const drive = (s.mainUp ? 5 * s.hoist * (1 - s.mainLuff) : 0) + (s.jibUp ? 3 * s.jibOut * (1 - s.jibLuff) : 0)
      const power = windAngle < 40 ? 0 : Math.sin(Math.min(90, windAngle) * DEG)
      heel += (drive * power - heel) * Math.min(1, dt * 1.5)
      boat.rotation.x = lee * heel * DEG + Math.sin(time * 0.8) * 0.01
    }
    // Wind streaks.
    const wa = windAngle * DEG
    const from = v(Math.cos(wa), 0, -lee * Math.sin(wa))
    const side = v(-from.z, 0, from.x)
    for (const m of streaks) {
      const d = m.userData as { phase: number; h: number; off: number }
      const p = (d.phase + time * 0.12) % 1
      m.position.copy(from).multiplyScalar(14 - p * 28).addScaledVector(side, d.off).add(v(0, d.h, 0))
      m.quaternion.setFromUnitVectors(v(1, 0, 0), from)
      ;(m.material as THREE.MeshBasicMaterial).opacity = Math.sin(Math.PI * p) * 0.55
    }
    if (tween) {
      tween.t = Math.min(1, tween.t + dt / 0.9)
      const e = tween.t < 0.5 ? 2 * tween.t * tween.t : 1 - Math.pow(-2 * tween.t + 2, 2) / 2
      camera.position.lerpVectors(tween.from, tween.to, e)
      controls.target.lerpVectors(tween.tFrom, tween.tTo, e)
      if (tween.t >= 1) tween = null
    }
    applyHighlight(time)
    const mainUp = !!cur && cur.halyard * (1 - 0.28 * cur.reef) > 0.08
    for (const id of CONTROL_IDS) lineLabels[id].visible = showLines && (id !== 'reef' || mainUp)
    for (const id of PART_LABELS) partLabels[id].visible = showParts
    controls.update()
    renderer.render(scene, camera)
    labelRenderer.render(scene, camera)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)

  return {
    setControls(c, instant) {
      target = { ...c }
      if (!cur || instant) cur = { ...c }
      dirty = true
    },
    setWind(angle, fromStarboard) {
      windTarget = angle
      lee = fromStarboard ? -1 : 1
      dirty = true
    },
    setSelected(id) {
      selected = id
      setRopeRadius()
    },
    setView(id) {
      const vw = VIEWS[id]
      tween = { from: camera.position.clone(), to: vw.pos.clone(), tFrom: controls.target.clone(), tTo: vw.target.clone(), t: 0 }
    },
    setLabels(texts) {
      for (const id of CONTROL_IDS) lineLabels[id].element.textContent = texts.controls[id]
      for (const id of PART_LABELS) partLabels[id].element.textContent = texts.parts[id]
    },
    setLabelMode(lines, parts) {
      showLines = lines
      showParts = parts
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
      labelRenderer.domElement.remove()
    },
  }
}
