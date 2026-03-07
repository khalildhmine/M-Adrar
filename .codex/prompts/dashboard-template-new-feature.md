---
description: Scaffold a new feature directory
argument-hint: <domain>
name: dashboard-template-new-feature
---

# New Feature Directory Scaffolding

Create a new feature directory following the project's architecture boundaries.

## Usage
```
/dashboard-template-new-feature billing
```

## Steps

1. Parse the argument as `<domain>`.
   - If no argument provided, ask the user for the domain name.

2. Create the feature directory structure:

```
src/features/<domain>/
  index.ts           # Public API barrel (only file allowed to re-export)
  types.ts           # Domain types and interfaces
  service.ts         # Domain business logic
  queries.ts         # TanStack Query hooks
  constants.ts       # Domain constants
```

3. Generate files:

**`src/features/<domain>/types.ts`**
```typescript
// Domain types for <domain>
// Export interfaces and type definitions used across this feature

export interface <Domain>Item {
  id: string;
  // TODO: Add domain-specific fields
  created_at: string;
  updated_at: string;
}
```

**`src/features/<domain>/service.ts`**
```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { <Domain>Item } from './types';

// Domain business logic — called by Route Handlers and Server Components
// This file should NOT import from src/app/**

export async function list<Domain>s(
  supabase: SupabaseClient,
  cursor?: string,
  limit = 20
): Promise<{ items: <Domain>Item[]; nextCursor: string | null; hasMore: boolean }> {
  // TODO: Implement with cursor pagination
  throw new Error('Not implemented');
}

export async function create<Domain>(
  supabase: SupabaseClient,
  userId: string,
  input: Omit<<Domain>Item, 'id' | 'created_at' | 'updated_at'>
): Promise<<Domain>Item> {
  // TODO: Implement
  throw new Error('Not implemented');
}
```

**`src/features/<domain>/queries.ts`**
```typescript
import { queryOptions } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { <Domain>Item } from './types';

export const <domain>Keys = {
  all: ['<domain>'] as const,
  list: (cursor?: string) => [...<domain>Keys.all, 'list', cursor] as const,
  detail: (id: string) => [...<domain>Keys.all, 'detail', id] as const,
};

export function <domain>ListOptions(cursor?: string) {
  return queryOptions({
    queryKey: <domain>Keys.list(cursor),
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      // TODO: Implement query
      return { items: [] as <Domain>Item[], nextCursor: null, hasMore: false };
    },
  });
}
```

**`src/features/<domain>/constants.ts`**
```typescript
// Domain constants for <domain>
// Keep domain-specific magic values here

export const <DOMAIN>_PAGE_SIZE = 20;
```

**`src/features/<domain>/index.ts`**
```typescript
// Public API for the <domain> feature
// Only re-export what other layers need

export type { <Domain>Item } from './types';
export { list<Domain>s, create<Domain> } from './service';
export { <domain>Keys, <domain>ListOptions } from './queries';
```

4. Print a summary of what was created and remind about:
   - Filling in domain-specific types in `types.ts`
   - Implementing service functions in `service.ts`
   - Creating API route at `src/app/api/v1/<domain>/route.ts` (use `/dashboard-template-new-api`)
   - Adding Supabase migration if new tables are needed
   - Feature depends on `lib` only — never import from `app`
