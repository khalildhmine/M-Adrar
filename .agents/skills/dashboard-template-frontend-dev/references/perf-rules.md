# Performance Rules (PERF-001 ~ PERF-004)

Source: `docs/architecture/development-rules.md` Section 8, `docs/architecture/nextjs-best-case-rules.md` Section 3

## PERF-001 Waterfall Elimination (MUST)

- Parallelize independent I/O with `Promise.all`. (`async-parallel`)
- In Route Handlers and Server Actions, start promises early, await late. (`async-api-routes`)

```typescript
// Bad: Sequential waterfall
const users = await getUsers();
const posts = await getPosts();

// Good: Parallel execution
const [users, posts] = await Promise.all([getUsers(), getPosts()]);
```

## PERF-002 RSC-First Strategy (MUST)

- Default is Server Component. Only use Client Component when interaction or browser APIs are needed.
- Minimize props serialized from server to client — send only required fields. (`server-serialization`)

```typescript
// Bad: Entire object passed to client
<ClientCard data={fullUserObject} />

// Good: Only needed fields
<ClientCard name={user.name} avatar={user.avatarUrl} />
```

## PERF-003 Server Fetch Composition (SHOULD)

- Structure components to parallelize server fetches. (`server-parallel-fetching`)
- Don't create unnecessary sequential fetches at page root level.

```typescript
// Good: Parallel fetch via component composition
export default async function Page() {
  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <UserSection />  {/* fetches users */}
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <PostSection />  {/* fetches posts independently */}
      </Suspense>
    </>
  );
}
```

## PERF-004 Bundle Size Control (MUST)

- Avoid barrel imports. Import directly from the module. (`bundle-barrel-imports`)
- Lazy-load heavy client components (charts, editors, maps) with `next/dynamic`. (`bundle-dynamic-imports`)

```typescript
// Bad: Barrel import
import { Chart, Editor, Map } from '@/components';

// Good: Direct import + dynamic
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('@/components/chart'), { ssr: false });
```

## Cross-Reference
- Vercel skill: `vercel-react-best-practices` (rules: async-*, bundle-*, server-*)
