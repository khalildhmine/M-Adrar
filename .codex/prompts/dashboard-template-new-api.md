---
description: Scaffold a new API route under /api/v1/
argument-hint: <domain>/<resource>
name: dashboard-template-new-api
---

# New API Route Scaffolding

Create a new API route following project conventions.

## Usage
```
/dashboard-template-new-api academy/students
```

## Steps

1. Parse the argument as `<domain>/<resource>`.
   - If no argument provided, ask the user for domain and resource name.

2. Create the route file at:
   ```
   src/app/api/v1/<domain>/<resource>/route.ts
   ```

3. Generate the route with this template:

```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// TODO: Define your input schema
const createSchema = z.object({
  // Add fields here
});

const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = listQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!query.success) {
    return NextResponse.json(
      { error: 'Invalid query', details: query.error.flatten() },
      { status: 400 }
    );
  }

  const { cursor, limit } = query.data;

  // TODO: Replace '<table>' with actual table name
  let queryBuilder = supabase
    .from('<table>')
    .select('*')
    .order('id', { ascending: true })
    .limit(limit + 1);

  if (cursor) {
    queryBuilder = queryBuilder.gt('id', cursor);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ data: items, nextCursor, hasMore });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const input = createSchema.safeParse(body);

  if (!input.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: input.error.flatten() },
      { status: 400 }
    );
  }

  // TODO: Delegate to domain logic in src/features/<domain>/
  const { data, error } = await supabase
    .from('<table>')
    .insert({ ...input.data, created_by: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

4. Print a summary of what was created and remind about:
   - Updating the zod schema with actual fields
   - Replacing `<table>` with the actual table name
   - Creating corresponding migration if new table is needed
   - Adding RLS policies for the table
