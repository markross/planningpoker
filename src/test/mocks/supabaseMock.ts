import { vi } from 'vitest'

type MockQueryBuilder = {
  select: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  upsert: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
  maybeSingle: ReturnType<typeof vi.fn>
}

function createMockQueryBuilder(): MockQueryBuilder {
  const builder: MockQueryBuilder = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  }

  // Each method returns the builder for chaining
  builder.select.mockReturnValue(builder)
  builder.insert.mockReturnValue(builder)
  builder.update.mockReturnValue(builder)
  builder.delete.mockReturnValue(builder)
  builder.upsert.mockReturnValue(builder)
  builder.eq.mockReturnValue(builder)
  builder.single.mockReturnValue(builder)
  builder.maybeSingle.mockReturnValue(builder)

  return builder
}

export function createMockSupabaseClient() {
  const queryBuilder = createMockQueryBuilder()

  return {
    from: vi.fn().mockReturnValue(queryBuilder),
    auth: {
      signInAnonymously: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    channel: vi.fn(),
    removeChannel: vi.fn(),
    _queryBuilder: queryBuilder,
  }
}
