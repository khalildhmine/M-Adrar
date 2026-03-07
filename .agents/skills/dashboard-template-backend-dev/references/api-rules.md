# API Rules (API-001 ~ API-004)

Source: `docs/architecture/development-rules.md` Section 6

## API-001 Versioning (MUST)

All API routes MUST be created under `src/app/api/v1/**/route.ts`.

```
src/app/api/v1/
  auth/
    login/route.ts
    register/route.ts
  academy/
    enrollments/route.ts
  <domain>/
    <resource>/route.ts
```

## API-002 Input Validation & Error Codes (MUST)

- All input MUST be validated with `zod.safeParse`.
- Standard status codes:
  - `400` — Input validation error
  - `401` — Authentication failure
  - `403` — Authorization failure (insufficient permissions)
  - `500` — Server/DB error

```typescript
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    );
  }

  // ... business logic
}
```

## API-003 Pagination (MUST)

List APIs use cursor pagination by default.

```typescript
// Cursor pagination pattern
const { cursor, limit = 20 } = params;

const { data } = await supabase
  .from('enrollments')
  .select('*')
  .gt('id', cursor ?? '')
  .order('id', { ascending: true })
  .limit(limit + 1);  // +1 to detect hasMore

const hasMore = data.length > limit;
const items = hasMore ? data.slice(0, limit) : data;
const nextCursor = hasMore ? items[items.length - 1].id : null;
```

## API-004 Business Logic Separation (MUST)

Route Handlers are thin adapters. Domain logic goes in `features`/`lib`.

```typescript
// Good: Thin route handler
export async function POST(request: NextRequest) {
  const body = await request.json();
  const input = schema.safeParse(body);
  if (!input.success) return NextResponse.json({ error: '...' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Delegate to domain
  const result = await enrollStudent(supabase, user.id, input.data);
  return NextResponse.json(result, { status: 201 });
}
```
