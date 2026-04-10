import { describe, it, expect } from 'vitest'
import { exportToMarkdown } from '@/utils/export'

describe('exportToMarkdown', () => {
  it('returns a string', () => {
    const result = exportToMarkdown([])
    expect(typeof result).toBe('string')
  })
})
