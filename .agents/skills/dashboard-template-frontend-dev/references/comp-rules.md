# Component Design Rules (COMP-001 ~ COMP-004)

Source: `docs/architecture/nextjs-best-case-rules.md` Section 4

## COMP-001 No Boolean Prop Proliferation (MUST)

- Don't use `isX`, `isY` boolean combinations to create mega-component branching.
- Instead, create explicit variant components.

```typescript
// Bad: Boolean prop explosion
<Card isCompact isHighlighted isAdmin hasActions />

// Good: Explicit variants
<CompactCard highlighted>
  <AdminActions />
</CompactCard>
```

## COMP-002 Compound Components (SHOULD)

- Complex UI should use `Root/Trigger/Content` compound pattern.
- Child components read shared state via context, reducing props drilling.

```typescript
// Good: Compound pattern
<Dialog>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Confirm</Dialog.Title>
    <Dialog.Close>Cancel</Dialog.Close>
  </Dialog.Content>
</Dialog>
```

## COMP-003 State Implementation Hiding (MUST)

- UI components must not directly know state implementation (zustand/useState/react-query).
- Provider/Container injects `{ state, actions, meta }` interface.

```typescript
// Bad: Component knows about zustand
function UserList() {
  const users = useUserStore((s) => s.users);
  // ...
}

// Good: State injected via interface
function UserList({ users, onSelect }: UserListProps) {
  // Pure UI component
}
```

## COMP-004 React 19 API Usage (SHOULD)

- New components should use React 19 patterns: `ref` as prop, `use(Context)`.
- Gradually migrate from `forwardRef` when there are no compatibility issues.

```typescript
// React 19: ref as regular prop
function Input({ ref, ...props }: { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}

// React 19: use() instead of useContext()
import { use } from 'react';
function Child() {
  const theme = use(ThemeContext);
}
```

## Cross-Reference
- Vercel skill: `vercel-composition-patterns` (architecture-*, state-*, patterns-*, react19-*)
