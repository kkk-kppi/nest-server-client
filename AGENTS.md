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
pnpm test             # Vitest (single run)
pnpm test:coverage    # Vitest with coverage
pnpm verify:api       # typecheck + API layer tests (src/core/http/ src/mocks/)
pnpm build            # typecheck + vite build (outputs to dist/)
pnpm e2e:open         # Cypress interactive
pnpm e2e:run          # Cypress headless (electron)
```

**CI quality gate order**: `lint → typecheck → test → verify:api → build`

## Pre-commit Hooks (Husky)

- **pre-commit**: `lint-staged` runs:
  - `*.{js,mjs,cjs,ts,tsx,vue}` → `eslint --fix`
  - `*.{css,scss}` → `stylelint --fix`
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
├── core/          # Infrastructure: http/, router/, store/, config/
├── features/      # Business domains: auth/, admin/, workspace/, home/
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
| `VITE_ENTRY_JS_BUDGET_KIB`    | `300`                   | Entry JS bundle budget                               |
| `VITE_ASYNC_CHUNK_BUDGET_KIB` | `300`                   | Async chunk budget                                   |

## Build Presets

| Preset                     | Chunk Strategy                             | Bundle Report |
| -------------------------- | ------------------------------------------ | ------------- |
| development                | basic (all vendor in one chunk)            | off           |
| test/stage/production/prod | balanced (vue/router/pinia/http separated) | on            |

CI resolves preset from branch: develop→development, test→test, stage→stage, main/tags→prod.

## Testing

- **Unit**: Vitest + Vue Test Utils, jsdom environment
- **Test files**: `src/**/*.test.ts`
- **Coverage thresholds**: 80% (lines/statements/functions/branches)
- **Coverage scope**: Limited to specific files in `vitest.config.ts` coverage.include
- **E2E**: Cypress (electron browser)
- **API verification**: `pnpm verify:api` runs typecheck + tests against `src/core/http/` and `src/mocks/`

## HTTP Layer

- Axios instance: `src/core/http/client.ts`
- Endpoint type inference: `definePostEndpoint<PATH, Response, Request>` with `InferEndpointRequest/InferEndpointResponse`
- Interceptors: auth header injection, 401 handling, error normalization
- Feature APIs: `src/features/{auth,admin,workspace}/api.ts`

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
