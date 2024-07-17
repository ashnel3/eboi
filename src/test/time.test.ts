import { describe, expect, test } from 'vitest'
import { timeunit } from '../util/time.js'

describe('time.ts', () => {
  test('should parse time strings', () => {
    expect(timeunit('1.2d')).toBe(103680000)
  })
  test('should throw on negative', () => {
    expect(() => timeunit('-1m')).toThrow()
  })
})
