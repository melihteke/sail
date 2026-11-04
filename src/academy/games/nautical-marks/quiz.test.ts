import { describe, expect, it } from 'vitest'
import { en } from '../../i18n/en'
import { nl } from '../../i18n/nl'
import { tr } from '../../i18n/tr'
import { marks } from './marks'
import { makeQuiz, seededRandom } from './quiz'

describe('makeQuiz', () => {
  const ids = marks.map((m) => m.id)

  it('builds valid questions', () => {
    const quiz = makeQuiz(ids, 10, 4, seededRandom(42))
    expect(quiz).toHaveLength(10)
    for (const q of quiz) {
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.options).toContain(q.answer)
    }
    for (let i = 1; i < quiz.length; i++) expect(quiz[i].answer).not.toBe(quiz[i - 1].answer)
  })

  it('is reproducible with the same seed', () => {
    expect(makeQuiz(ids, 5, 4, seededRandom(7))).toEqual(makeQuiz(ids, 5, 4, seededRandom(7)))
  })
})

describe('translations', () => {
  it('have every mark text and no empty strings', () => {
    for (const dict of [en, nl, tr]) {
      for (const m of marks) {
        for (const f of ['name', 'meaning', 'light', 'tip']) {
          expect(dict[`mark.${m.id}.${f}` as keyof typeof en]).toBeTruthy()
        }
      }
      for (const v of Object.values(dict)) expect(v.trim()).not.toBe('')
    }
  })
})
