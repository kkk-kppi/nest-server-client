# AGENTS.md

## Project Overview

Vue 3 + TypeScript + Vite SPA with layered architecture (`app/core/features/shared`).
Package manager: **pnpm** (lockfile: `pnpm-lock.yaml`). Node 22.

## Essential Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (Vite HMR)
pnpm typecheck        # vue-tsc -b
pnpm lint             # ESLint + Stylelint
pnpm lint:fix         # Auto-fix lint issues
pnpm format           # Prettier formatting
pnpm format:check     # Prettier check (CI)
pnpm test             # Vitest (single run)
pnpm test:coverage    # Vitest with coverage
pnpm verify:api       # typecheck + API layer tests (src/core/http/ src/mocks/)
pnpm build            # typecheck + vite build (outputs to dist/)
pnpm e2e              # Playwright E2E tests
pnpm e2e:open         # Playwright interactive
pnpm build-storybook  # Build Storybook
```

**CI quality gate order**: `lint → format:check → typecheck → test:coverage → verify:api → build → e2e → build-storybook`

## Pre-commit Hooks (Husky)

- **pre-commit**: `lint-staged` runs:
  - `*.{js,mjs,cjs,ts,tsx,vue}` → `eslint --fix` + `prettier --write`
  - `*.{css,scss,vue}` → `stylelint --fix` + `prettier --write`
  - `*.{json,md,yml,yaml}` → `prettier --write`
- **pre-push**: Branch name validation
- **commit-msg**: Conventional commits (`@commitlint/config-conventional`)

## Branch Naming (enforced)

```
main|master|develop
release/<name>
feature|fix|hotfix|chore|refactor|docs|test/<name>
```

Lowercase, alphanumeric, dots, hyphens only.

## Architecture

```
src/
├── app/           # Assembly: bootstrap.ts, AppRoot.vue, layouts, views
├── core/          # Infrastructure: http/, router/, store/, config/, i18n/, theme/, observability/
├── features/      # Business domains: auth/, admin/, workspace/, home/, system/
├── shared/        # Cross-domain: composables/, components/, pagination.ts
└── mocks/         # MSW browser mocking (handlers.ts, browser.ts)
```

**Entry flow**: `main.ts → app/bootstrap.ts → AppRoot.vue`

- MSW mocking enabled conditionally via `VITE_ENABLE_MOCK=true`
- Path alias: `@` → `src/`

## Environment Variables

| Variable                      | Default                 | Purpose                                              |
| ----------------------------- | ----------------------- | ---------------------------------------------------- |
| `VITE_API_BASE_URL`           | `http://localhost:3000` | Backend API base                                     |
| `VITE_ENABLE_MOCK`            | `false`                 | Enable MSW browser mocking                           |
| `VITE_BUILD_PRESET`           | auto                    | Build preset: development/test/stage/production/prod |
| `VITE_ENTRY_JS_BUDGET_KIB`    | `1500`                  | Entry JS bundle budget                               |
| `VITE_ASYNC_CHUNK_BUDGET_KIB` | `900`                   | Async chunk budget                                   |

## Build Presets

| Preset                     | Chunk Strategy                             | Bundle Report |
| -------------------------- | ------------------------------------------ | ------------- |
| development                | basic (all vendor in one chunk)            | off           |
| test/stage/production/prod | balanced (vue/router/pinia/http separated) | on            |

CI resolves preset from branch: develop→development, test→test, stage→stage, main/tags→prod.

## Testing

- **Unit**: Vitest + Vue Test Utils, jsdom environment
- **Test files**: `src/**/*.test.ts`
- **Coverage thresholds**: 45% lines, 80% branches, 55% functions (real baseline)
- **Coverage scope**: `src/**/*.{ts,vue}` excluding declarations, tests, stories, mocks
- **E2E**: Playwright (Chromium + mobile Chrome)
- **API verification**: `pnpm verify:api` runs typecheck + tests against `src/core/http/` and `src/mocks/`

## Architecture Boundaries (ESLint enforced)

- `core` → must not import from `features` (except router modules)
- `shared` → should not import from feature internals (warning)
- `features` → should not import from `app` layer
- Cross-feature imports should go through feature public entry

## HTTP Layer

- Axios instance: `src/core/http/client.ts`
- Endpoint type inference: `definePostEndpoint<PATH, Response, Request>` with `InferEndpointRequest/InferEndpointResponse`
- Interceptors: auth header injection, 401 handling, error normalization
- Feature APIs: `src/features/{auth,admin,workspace,system}/api.ts`

## Style Conventions

- Vue SFC with `<script setup lang="ts">`
- Composables follow `useAsyncState/usePaginationState/useRoutePageQuery` patterns
- Global styles: `src/style.css`
- Icons: `public/icons.svg`, images: `src/assets/`

## Key Gotchas

- `pnpm build` runs `vue-tsc -b` first — type errors block builds
- Mock worker file at `public/mockServiceWorker.js` must stay in sync with MSW version
- Coverage report generated at `dist/bundle-report.html` on non-development builds
- Dev server proxies `/api` to `VITE_API_BASE_URL`
