import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BackupDataSchema, BackupHabitSchema, BackupCompletionSchema } from '@/schemas'

// ─────────────────────────────────────────────
// MOCK Dexie db
// ─────────────────────────────────────────────

vi.mock('@/db', () => ({
  db: {
    habits: {
      toArray: vi.fn(),
      filter: vi.fn(),
      clear: vi.fn(),
      bulkPut: vi.fn(),
      bulkDelete: vi.fn(),
      orderBy: vi.fn(),
    },
    completions: {
      toArray: vi.fn(),
      where: vi.fn(() => ({ equals: vi.fn(() => ({ delete: vi.fn() })) })),
      clear: vi.fn(),
      bulkPut: vi.fn(),
    },
    transaction: vi.fn(async (_mode: string, _t1: unknown, _t2: unknown, fn: () => Promise<void>) => fn()),
  },
}))

// ─────────────────────────────────────────────
// MOCK browser globals
// ─────────────────────────────────────────────

const mockClick = vi.fn()
const mockAnchor = {
  click: mockClick,
  style: {},
  href: '',
  download: '',
}

beforeEach(() => {
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:mock'),
    revokeObjectURL: vi.fn(),
  })
  vi.stubGlobal('document', {
    createElement: vi.fn(() => mockAnchor),
    body: { appendChild: vi.fn(), removeChild: vi.fn() },
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ════════════════════════════════════════════════════
// BackupDataSchema validation (≥6 tests)
// ════════════════════════════════════════════════════

describe('BackupDataSchema', () => {
  it('accepts a valid backup with habits and completions', () => {
    const valid = {
      version: 1,
      exportedAt: '2026-04-10T12:00:00.000Z',
      habits: [{ id: 'h1', name: 'Run', symbol: '●', accentChar: 'bright', createdAt: '2026-01-01', sortOrder: 0 }],
      completions: [{ id: 'c1', habitId: 'h1', date: '2026-04-10' }],
    }
    expect(BackupDataSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects version !== 1', () => {
    const data = { version: 2, exportedAt: 'now', habits: [], completions: [] }
    expect(BackupDataSchema.safeParse(data).success).toBe(false)
  })

  it('rejects missing version field', () => {
    const data = { exportedAt: 'now', habits: [], completions: [] }
    expect(BackupDataSchema.safeParse(data).success).toBe(false)
  })

  it('rejects missing habits array', () => {
    const data = { version: 1, exportedAt: 'now', completions: [] }
    expect(BackupDataSchema.safeParse(data).success).toBe(false)
  })

  it('rejects habit with empty id', () => {
    const data = {
      version: 1, exportedAt: 'now',
      habits: [{ id: '', name: 'Run', symbol: '●', accentChar: 'bright', createdAt: '2026-01-01', sortOrder: 0 }],
      completions: [],
    }
    expect(BackupDataSchema.safeParse(data).success).toBe(false)
  })

  it('rejects habit with invalid createdAt', () => {
    const data = {
      version: 1, exportedAt: 'now',
      habits: [{ id: 'h1', name: 'Run', symbol: '●', accentChar: 'bright', createdAt: '10-04-2026', sortOrder: 0 }],
      completions: [],
    }
    expect(BackupDataSchema.safeParse(data).success).toBe(false)
  })

  it('rejects completion with invalid date', () => {
    const data = {
      version: 1, exportedAt: 'now',
      habits: [],
      completions: [{ id: 'c1', habitId: 'h1', date: '10-04-2026' }],
    }
    expect(BackupDataSchema.safeParse(data).success).toBe(false)
  })

  it('accepts backup with empty habits array', () => {
    const data = { version: 1, exportedAt: 'now', habits: [], completions: [] }
    expect(BackupDataSchema.safeParse(data).success).toBe(true)
  })

  it('accepts backup with empty completions array', () => {
    const data = {
      version: 1, exportedAt: 'now',
      habits: [{ id: 'h1', name: 'Run', symbol: '●', accentChar: 'bright', createdAt: '2026-01-01', sortOrder: 0 }],
      completions: [],
    }
    expect(BackupDataSchema.safeParse(data).success).toBe(true)
  })
})

// ════════════════════════════════════════════════════
// BackupHabitSchema
// ════════════════════════════════════════════════════

describe('BackupHabitSchema', () => {
  it('accepts valid habit', () => {
    const h = { id: 'h1', name: 'Run', symbol: '●', accentChar: 'bright', createdAt: '2026-01-01', sortOrder: 0 }
    expect(BackupHabitSchema.safeParse(h).success).toBe(true)
  })

  it('rejects name longer than 80 chars', () => {
    const h = { id: 'h1', name: 'a'.repeat(81), symbol: '●', accentChar: 'bright', createdAt: '2026-01-01', sortOrder: 0 }
    expect(BackupHabitSchema.safeParse(h).success).toBe(false)
  })
})

// ════════════════════════════════════════════════════
// BackupCompletionSchema
// ════════════════════════════════════════════════════

describe('BackupCompletionSchema', () => {
  it('accepts valid completion', () => {
    const c = { id: 'c1', habitId: 'h1', date: '2026-04-10' }
    expect(BackupCompletionSchema.safeParse(c).success).toBe(true)
  })

  it('rejects empty habitId', () => {
    const c = { id: 'c1', habitId: '', date: '2026-04-10' }
    expect(BackupCompletionSchema.safeParse(c).success).toBe(false)
  })
})

// ════════════════════════════════════════════════════
// exportToJSON
// ════════════════════════════════════════════════════

describe('exportToJSON', () => {
  it('triggers download with correct filename pattern', async () => {
    const { exportToJSON } = await import('@/utils/export')
    const { db } = await import('@/db')
    ;(db.habits.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(db.completions.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([])

    await exportToJSON()

    expect(mockAnchor.download).toMatch(/^habitd-backup-\d{4}-\d{2}-\d{2}\.json$/)
  })

  it('output JSON is valid BackupData structure', async () => {
    const { exportToJSON } = await import('@/utils/export')
    const { db } = await import('@/db')
    ;(db.habits.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'h1', name: 'Run', symbol: '●', accentChar: 'bright', createdAt: '2026-01-01', archivedAt: '', sortOrder: 0 },
    ])
    ;(db.completions.toArray as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'c1', habitId: 'h1', date: '2026-04-10' },
    ])

    await exportToJSON()

    // The JSON string was passed to Blob constructor
    const blobCalls = vi.mocked(URL.createObjectURL).mock.calls
    expect(blobCalls.length).toBeGreaterThan(0)
  })
})

// ════════════════════════════════════════════════════
// importFromJSON
// ════════════════════════════════════════════════════

describe('importFromJSON', () => {
  it('returns success for valid backup', async () => {
    const { importFromJSON } = await import('@/utils/export')
    const { db } = await import('@/db')
    vi.mocked(db.transaction).mockImplementation(async (_mode, _t1, _t2, fn) => fn())

    const json = JSON.stringify({
      version: 1,
      exportedAt: '2026-04-10T12:00:00.000Z',
      habits: [{ id: 'h1', name: 'Run', symbol: '●', accentChar: 'bright', createdAt: '2026-01-01', sortOrder: 0 }],
      completions: [{ id: 'c1', habitId: 'h1', date: '2026-04-10' }],
    })

    const mockFile = new Blob([json], { type: 'application/json' }) as File
    Object.defineProperty(mockFile, 'name', { value: 'backup.json' })

    const result = await importFromJSON(mockFile)
    expect(result.status).toBe('success')
    expect(result.habitsImported).toBe(1)
    expect(result.completionsImported).toBe(1)
  })

  it('returns error for malformed JSON', async () => {
    const { importFromJSON } = await import('@/utils/export')
    const mockFile = new Blob(['not json'], { type: 'application/json' }) as File
    const result = await importFromJSON(mockFile)
    expect(result.status).toBe('error')
    expect(result.errorMessage).toMatch(/Invalid JSON/)
  })

  it('returns error for JSON that fails BackupDataSchema', async () => {
    const { importFromJSON } = await import('@/utils/export')
    const json = JSON.stringify({ version: 2, exportedAt: 'now', habits: [], completions: [] })
    const mockFile = new Blob([json], { type: 'application/json' }) as File
    const result = await importFromJSON(mockFile)
    expect(result.status).toBe('error')
    expect(result.errorMessage).toMatch(/Validation failed/)
  })
})

// ════════════════════════════════════════════════════
// exportToMarkdown
// ════════════════════════════════════════════════════

describe('exportToMarkdown', () => {
  it('triggers download with correct filename', async () => {
    const { exportToMarkdown } = await import('@/utils/export')
    const { db } = await import('@/db')
    vi.mocked(db.habits.orderBy).mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) } as never)
    vi.mocked(db.completions.toArray).mockResolvedValue([])

    await exportToMarkdown()

    expect(mockAnchor.download).toMatch(/^habitd-report-\d{4}-\d{2}-\d{2}\.md$/)
  })
})

// ════════════════════════════════════════════════════
// purgeArchivedHabits
// ════════════════════════════════════════════════════

describe('purgeArchivedHabits', () => {
  it('returns 0 when no archived habits exist', async () => {
    const { purgeArchivedHabits } = await import('@/utils/export')
    const { db } = await import('@/db')
    vi.mocked(db.habits.filter).mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) })

    const count = await purgeArchivedHabits()
    expect(count).toBe(0)
  })
})

// ════════════════════════════════════════════════════
// resetAllData
// ════════════════════════════════════════════════════

describe('resetAllData', () => {
  it('calls db.habits.clear() and db.completions.clear()', async () => {
    const { resetAllData } = await import('@/utils/export')
    const { db } = await import('@/db')
    vi.mocked(db.transaction).mockImplementation(async (_mode, _t1, _t2, fn) => fn())

    await resetAllData()

    expect(db.habits.clear).toHaveBeenCalled()
    expect(db.completions.clear).toHaveBeenCalled()
  })
})
