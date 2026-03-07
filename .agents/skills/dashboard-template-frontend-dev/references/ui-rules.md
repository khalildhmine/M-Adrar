# UI/UX/Accessibility Rules (UI-001 ~ UI-004)

Source: `docs/architecture/nextjs-best-case-rules.md` Section 5

## UI-001 Accessibility Basics (MUST)

- Icon buttons MUST have `aria-label`.
- Input fields MUST have `<label>` or `aria-label`.
- Actions use `<button>`, navigation uses `<a>`/`<Link>`.
- Never remove `focus-visible` outline.

```tsx
// Bad: Icon button without label
<button onClick={onClose}><XIcon /></button>

// Good: Accessible icon button
<button onClick={onClose} aria-label="Close dialog"><XIcon /></button>

// Bad: Input without label
<input type="email" placeholder="Email" />

// Good: Labeled input
<label htmlFor="email">Email</label>
<input id="email" type="email" placeholder="Email" />
```

## UI-002 Form Quality (MUST)

- All inputs must have `name`, `autocomplete`, and appropriate `type`.
- Errors displayed adjacent to the field. On submit, focus moves to first error.
- Loading state text uses ellipsis: `Saving...`

```tsx
// Good: Complete form field
<input
  name="email"
  type="email"
  autoComplete="email"
  aria-invalid={!!errors.email}
  aria-describedby="email-error"
/>
{errors.email && <p id="email-error" role="alert">{errors.email.message}</p>}
```

## UI-003 Animation Rules (MUST)

- MUST respect `prefers-reduced-motion`.
- Prefer `transform`/`opacity` based animations.
- Never use `transition: all`.

```css
/* Good: Motion-safe animation */
@media (prefers-reduced-motion: no-preference) {
  .animate {
    transition: transform 200ms ease, opacity 200ms ease;
  }
}

/* Bad */
.animate {
  transition: all 300ms;
}
```

## UI-004 Content/Layout (SHOULD)

- Long text: use `truncate` / `line-clamp` / `break-words`.
- Lists with 50+ items: apply virtualization or `content-visibility`.
- Date/number/currency formatting: use `Intl.*`, never hardcode format.

```typescript
// Good: Intl formatting
const formatted = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW'
}).format(amount);

// Bad: Hardcoded format
const formatted = `${amount.toLocaleString()}원`;
```

## Cross-Reference
- Vercel skill: `web-design-guidelines` (fetch latest rules from URL)
