import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { courses, isCourse } from './courses'
import { GameShell } from './ui'

function load<K extends string>(factory: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(() => factory().then((m) => ({ default: m[name] })))
}

const games: Record<string, LazyExoticComponent<ComponentType>> = {
  rig: load(() => import('./rig/RigGame'), 'RigGame'),
  tack: load(() => import('./tack/TackGame'), 'TackGame'),
  knots: load(() => import('./knots/KnotLab'), 'KnotLab'),
  lines: load(() => import('./lines/LinesGame'), 'LinesGame'),
  lookout: load(() => import('./lookout/LookoutGame'), 'LookoutGame'),
  vhf: load(() => import('./vhf/VhfGame'), 'VhfGame'),
  harbour: load(() => import('./harbour/HarbourGame'), 'HarbourGame'),
  anchor: load(() => import('./anchor/AnchorGame'), 'AnchorGame'),
  buoy: load(() => import('./buoy/BuoyGame'), 'BuoyGame'),
  collision: load(() => import('./collision/CollisionGame'), 'CollisionGame'),
  passage: load(() => import('./passage/PassageGame'), 'PassageRunGame'),
  decisions: load(() => import('./decisions/SkipperCall'), 'SkipperCall'),
}

export function GameRoute() {
  const { course, game } = useParams()
  if (!isCourse(course)) return <Navigate to="/rya" replace />
  if (!game || !courses[course].games.some((g) => g.id === game)) return <Navigate to={`/rya/${course}`} replace />
  const Game = games[game]
  return (
    <GameShell course={course} game={game}>
      <Game />
    </GameShell>
  )
}
