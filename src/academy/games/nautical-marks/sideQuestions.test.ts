import { describe, expect, it } from 'vitest'
import { seededRandom } from './quiz'
import { makeSideDrill, sideQuestion } from './sideQuestions'

describe('side drill', () => {
  it('answers cardinals with their named side', () => {
    expect(sideQuestion('west')).toMatchObject({ kind: 'cardinal', answer: 'W' })
  })

  it('answers lateral marks entering and leaving', () => {
    expect(sideQuestion('port', 'in').answer).toBe('port')
    expect(sideQuestion('port', 'out').answer).toBe('starboard')
    expect(sideQuestion('starboard-spar', 'in').answer).toBe('starboard')
    // Preferred channel to starboard is a modified port mark.
    expect(sideQuestion('pref-starboard', 'in').answer).toBe('port')
    expect(sideQuestion('pref-port', 'out').answer).toBe('port')
  })

  it('builds a drill without immediate repeats', () => {
    const d = makeSideDrill(20, seededRandom(3))
    expect(d).toHaveLength(20)
    for (let i = 1; i < d.length; i++) expect(d[i].markId).not.toBe(d[i - 1].markId)
  })
})
