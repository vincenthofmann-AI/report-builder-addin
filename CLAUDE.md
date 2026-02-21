# CLAUDE.md - MyGeotab Report Builder Add-In

AI agent documentation for understanding, modifying, and maintaining this codebase.

## What This Is

A React-based MyGeotab Add-In providing template-driven fleet reporting with <60 second time-to-value. Users discover insights through pre-configured templates instead of building queries from scratch.

**Live URL**: https://vincenthofmann-ai.github.io/report-builder-addin/

## Architecture

### Core Principles

1. **Pure Core, I/O at Edges** - Business logic has zero framework dependencies
2. **Dependency Inversion** - Core depends on interfaces, services implement
3. **Test-Driven Quality** - 96.8% coverage, all core logic tested
4. **Zenith Design System** - 100% Geotab Zenith components

### Directory Structure

```
src/
├── core/                    # Pure business logic (NO React, NO MyGeotab API)
│   ├── types.ts            # Domain types
│   ├── report-generator.ts # Pure aggregation/filtering logic
│   ├── validation.ts       # Input validation & XSS sanitization
│   └── interfaces.ts       # Dependency inversion contracts
│
├── app/services/           # I/O boundaries (implements core interfaces)
│   ├── data-fetcher.ts    # MyGeotab API integration
│   ├── geotab-context.tsx # API context provider
│   └── zenith-adapter.ts  # Zenith component wrappers
│
├── app/modules/            # React UI components
│   ├── home/              # Template discovery & selection
│   ├── builder/           # Custom report wizard (4 steps)
│   ├── canvas/            # Report preview & visualization
│   └── configuration/     # Filters, refinement, saved reports
│
├── app/data/              # Template definitions & mock data
│   └── insights/          # 27 pre-configured templates
│
└── test/                  # Test helpers & setup
    ├── helpers.ts         # Test data factories
    └── setup.ts           # Vitest configuration
```

### Dependency Flow

```
React Components (app/modules/)
       ↓ depends on
Services (app/services/)
       ↓ depends on (via interfaces)
Pure Core (core/)
```

**Rule**: Core modules NEVER import from services or React. Dependencies only point inward.

### Module Responsibilities

| Module | Responsibility |
|--------|----------------|
| `core/report-generator.ts` | Pure aggregation, filtering, sorting, pagination logic |
| `core/validation.ts` | Input validation, XSS sanitization, business rules |
| `core/interfaces.ts` | Abstract contracts for data source & storage |
| `app/services/data-fetcher.ts` | MyGeotab API calls with fallback to mocks |
| `app/modules/home/` | Insight category & template selection UI |
| `app/modules/builder/` | Custom report wizard (4-step flow) |
| `app/modules/canvas/` | Data visualization (tables, charts, drill-down) |

## Running the Code

### Development

```bash
make install     # Install dependencies (pnpm)
make dev         # Start dev server (http://localhost:5173)
make test        # Run tests (68 tests, <1s)
make test-watch  # Run tests in watch mode
make coverage    # Test coverage report (96.8%)
```

### Building

```bash
make build       # Build for production (outputs to docs/)
make deploy      # Test + build + commit + push to GitHub Pages
```

### Task Runner

Use `make` for all operations. Available targets:
- `make help` - Show all available commands
- `make test` - Fast test suite (<1s)
- `make test-coverage` - With coverage report
- `make type-check` - TypeScript validation
- `make lint` - Type checking (linter placeholder)
- `make clean` - Remove build artifacts

## Testing Strategy

### Test Organization

Tests are organized by **behavioral topic**, not implementation details:

```typescript
describe('applyFilters', () => {
  describe('equals operator', () => {
    it('filters records matching exact value', () => { ... });
    it('returns empty array when no matches', () => { ... });
  });
});
```

### Test Helpers

Use explicit factory functions (NOT pytest fixtures):

```typescript
import { makeDataRecord, makeReportConfig } from '../test/helpers';

const data = makeDataRecord({ category: 'A', value: 100 });
const config = makeReportConfig({ name: 'Custom Name' });
```

**Why helpers over fixtures**: Visible at test site, no hidden magic, easy to debug.

### Coverage Threshold

- **80%** minimum (enforced in CI)
- **Current**: 96.8% statements, 90.9% branches
- **Omitted**: Test files, setup, build configs

### Fast/Slow Split

- **Fast (default)**: Pure core logic tests (<1s total)
- **Slow (future)**: Integration tests, E2E tests
- Run `make test` for fast, `make test-all` for everything

## Code Conventions

### Commit Messages

**Imperative verb-first** (Add, Fix, Update, Remove, Refactor, Extract):

```
✓ Add drill-down click handlers to ChartView
✓ Extract domain logic into pure core module
✗ Added some new features
✗ Fixed bugs
```

### TypeScript

- **Strict mode enabled** - All type errors must be fixed
- **Type annotations required** - Function signatures must have types
- **No `any` types** - Use `unknown` and type guards instead

### File Naming

- **Components**: PascalCase (InsightSelector.tsx)
- **Utilities**: kebab-case (report-generator.ts)
- **Tests**: Match source file (report-generator.test.ts)

### Component Structure

```typescript
/**
 * Component Name
 * ==============
 *
 * Brief description of purpose and behavior.
 */

import { ... } from '...';

interface ComponentProps {
  // Props with JSDoc comments
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic
}
```

## Development Workflow

### Before You Code

1. **Read first** - Understand existing architecture before modifying
2. **Test-first** - Write failing test, then implement
3. **One logical change per commit** - Easy to review and revert

### Making Changes

1. **Core logic changes**:
   - Edit `src/core/` (pure functions)
   - Write/update tests in `.test.ts` file
   - Run `make test-coverage` to verify >80%
   - Commit: "Add/Update/Fix [specific behavior]"

2. **UI changes**:
   - Modify React components in `src/app/modules/`
   - Test manually in dev mode (`make dev`)
   - Commit: "Update [component] to [specific change]"

3. **API integration**:
   - Modify `src/app/services/data-fetcher.ts`
   - Ensure graceful fallback to mocks
   - Test with live MyGeotab data
   - Commit: "Update data fetching for [entity]"

### Quality Gates

Before pushing:

1. ✅ `make test` - All tests pass
2. ✅ `make type-check` - No TypeScript errors
3. ✅ `make build` - Build succeeds
4. ✅ Coverage stays >80%

CI enforces these on every push.

## Security

### Input Validation

**Parse, don't validate** - Transform raw input into validated types at the boundary:

```typescript
import { validateReportConfig } from './core/validation';

const result = validateReportConfig(rawInput);
if (!result.valid) {
  // Show user-friendly errors
  return result.errors;
}
```

### XSS Protection

All user input is sanitized before rendering:

```typescript
import { sanitizeString } from './core/validation';

const safe = sanitizeString(userInput); // Escapes <, >, ", ', /
```

### No Secrets

- No API keys, tokens, or credentials in code
- MyGeotab authentication handled by add-in SDK
- `.env` and credential files in `.gitignore`

## Common Tasks

### Adding a New Template

1. Edit `src/app/data/insights/[category].ts`
2. Add template with pre-configured columns/filters
3. Test template selection in UI

### Adding a New Data Source

1. Add entity type mapping in `data-fetcher.ts`
2. Add transform logic for entity → UI format
3. Update `getAllDataSources()` with metadata

### Modifying Aggregation Logic

1. Edit `src/core/report-generator.ts`
2. Write tests in `report-generator.test.ts`
3. Ensure coverage >80%
4. Commit: "Update aggregation to support [new behavior]"

### Fixing a Bug

1. Write failing test that reproduces bug
2. Fix bug in source code
3. Verify test now passes
4. Commit: "Fix [specific issue] in [module]"

## Troubleshooting

### Tests Failing

```bash
make test-watch  # See which test is failing
# Read test output, fix code, tests auto-rerun
```

### Type Errors

```bash
make type-check  # See all TypeScript errors
# Fix errors one by one, run again
```

### Build Fails

```bash
make clean       # Remove old build artifacts
make build       # Try fresh build
```

### Coverage Below Threshold

```bash
make test-coverage  # See uncovered lines
# Add tests for uncovered branches
```

## Production Deployment

### Deploy to GitHub Pages

```bash
make deploy  # Runs tests + build + commit + push
```

This:
1. Runs full test suite (fail-fast if tests fail)
2. Builds production bundle to `docs/`
3. Commits build artifacts
4. Pushes to GitHub
5. Deploys to https://vincenthofmann-ai.github.io/report-builder-addin/

### MyGeotab Add-In Registration

1. Navigate to: Administration → System → System Settings → Add-Ins
2. Click "Add New"
3. Configuration URL: `https://vincenthofmann-ai.github.io/report-builder-addin/configuration.json`
4. Save and reload

## Key Decisions

### Why Pure Core?

Separating business logic from React/MyGeotab enables:
- **Testability** - No mocking React or API, pure functions
- **Portability** - Could run in Node.js, CLI, or different UI
- **Confidence** - 96.8% coverage means bugs caught before production

### Why Template-First?

80% of users have common needs. Templates reduce:
- **Time to value** - <60 sec vs. 5-15 min for custom queries
- **Cognitive load** - Pick from 27 templates vs. learn API entities
- **Support burden** - Pre-validated queries vs. user errors

### Why Zenith Design System?

- **Consistency** - Looks like native MyGeotab
- **Accessibility** - WCAG 2.2 Level AA built-in
- **Maintenance** - Geotab maintains components, we just use them

## Contributing

1. **Read** this file first
2. **Follow** conventions (commit style, test organization, architecture)
3. **Test** before committing (coverage >80%)
4. **One logical change per commit**

Questions? Check:
- PRD: `docs/PRD_Report_Builder.md`
- README: `README.md`
- Architecture: This file

---

**Last updated**: 2026-02-21
**Test coverage**: 96.8% statements, 90.9% branches
**Production URL**: https://vincenthofmann-ai.github.io/report-builder-addin/
