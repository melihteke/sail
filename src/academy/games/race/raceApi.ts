import { SUPABASE } from '@/config'
import type { HelmEvent, RaceStatus } from './sim'

export interface CourseRow {
  id: string
  name: string
  area: string
  active: boolean
  is_current: boolean
  sort: number
}

export interface BoardRow {
  id: string
  name: string
  time_s: number
  tacks: number
  gybes: number
  distance_m: number
  created_at: string
}

export interface SubmitResult {
  status: Exclude<RaceStatus, 'racing'>
  time: number | null
  tacks: number
  gybes: number
  distance: number
  accepted: boolean
  reason?: 'too-fast' | 'expired'
  rank?: number
  on_board?: boolean
  personal_best?: boolean
  best_time?: number
  board_size?: number
}

export const online = () => Boolean(SUPABASE.url && SUPABASE.anonKey)

async function rest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SUPABASE.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE.anonKey,
      Authorization: `Bearer ${SUPABASE.anonKey}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // keep the status
    }
    throw new Error(message)
  }
  return (await res.json()) as T
}

export function listCourses() {
  return rest<CourseRow[]>('race_courses?select=id,name,area,active,is_current,sort&order=sort.asc')
}

export async function leaderboard(courseId: string) {
  const rows = await rest<BoardRow[]>(
    `race_results?select=id,name,time_s,tacks,gybes,distance_m,created_at&course_id=eq.${encodeURIComponent(courseId)}&order=time_s.asc,created_at.asc&limit=30`,
  )
  return rows.map((r) => ({ ...r, time_s: Number(r.time_s) }))
}

export function startRace(courseId: string, name: string) {
  return rest<string>('rpc/race_start', { method: 'POST', body: JSON.stringify({ p_course: courseId, p_name: name }) })
}

export async function submitRace(session: string, events: HelmEvent[]) {
  const r = await rest<SubmitResult>('rpc/race_submit', { method: 'POST', body: JSON.stringify({ p_session: session, p_events: events }) })
  return { ...r, time: r.time === null ? null : Number(r.time), best_time: r.best_time == null ? undefined : Number(r.best_time) }
}

/** Server error → translation key. */
export function errorKey(message: string): 'rc.err.name' | 'rc.err.busy' | 'rc.err.course' | 'rc.err.generic' {
  if (message.includes('invalid name')) return 'rc.err.name'
  if (message.includes('too many')) return 'rc.err.busy'
  if (message.includes('course not available')) return 'rc.err.course'
  return 'rc.err.generic'
}

export function formatRaceTime(s: number | null | undefined): string {
  if (s == null) return '–'
  const sign = s < 0 ? '−' : ''
  const a = Math.abs(s)
  const m = Math.floor(a / 60)
  const sec = a - m * 60
  return `${sign}${m}:${sec.toFixed(1).padStart(4, '0')}`
}
