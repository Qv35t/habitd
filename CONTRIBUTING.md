# contributing to habitd

---

## prerequisites

- Node.js 20+
- pnpm 10+
- A modern browser (Chrome 90+, Firefox 88+, Safari 15+)

---

## local setup

```bash
git clone https://github.com/YOUR/habitd
cd habitd
pnpm install
pnpm dev
```

---

## before submitting a PR

all four checks must pass locally:

```bash
pnpm type-check   # 0 TypeScript errors
pnpm lint         # 0 ESLint warnings or errors
pnpm test:run     # all Vitest tests green
pnpm build        # dist/ builds without errors
```

CI runs the same checks on every push and pull_request.
A failing CI blocks merge.

---

## code rules

**forbidden:**
- UI libraries (no shadcn/ui, MUI, Radix, etc.)
- Framer Motion — CSS transitions only
- `border-radius` > 2px
- `useEffect` for data fetching — use `useLiveQuery` from dexie-react-hooks
- Storing Dexie data in Zustand — Dexie is always source of truth
- Default exports for components — named exports only
- `any` type, `as unknown`, `// @ts-ignore`
- New npm packages without prior discussion in an issue
- `window.confirm()` — use the existing `ConfirmModal` component

**required:**
- JSDoc comment on every exported function (`@param`, `@returns`)
- Zod validation on all user input before writing to Dexie
- CSS custom properties from `tokens.css` via `var(--)`
- Vitest tests for all new pure functions in `src/engine/` and `src/utils/`

---

## architecture

- **Dexie.js** — IndexedDB wrapper, source of truth for all persistent data
- **Zustand** — UI-only state (active view, open modals, filters)
- **streakEngine.ts** — pure functions only, zero I/O, fully tested
- **useLiveQuery** — reactive bridge between Dexie and React components

---

## PR checklist

- [ ] `pnpm type-check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test:run` passes
- [ ] New pure functions have Vitest tests
- [ ] No new npm packages added
- [ ] No UI library imports added
- [ ] PR description explains what and why

---

*habitd — local-first, terminal-aesthetic habit tracker*
