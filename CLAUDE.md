# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SNACK (Self-hosted Next.js Adaptable Content Kit) is a no-BS, zero-dependency CMS for Next.js where users own their data. Following the shadcn philosophy - copy the code, don't install dependencies. 100% self-hosted, no third-party services required.

## Vision & Direction

### Core Philosophy
- **Copy, don't install**: Like shadcn, users copy code into their project
- **Own your data**: SQLite database lives in the user's project
- **Zero vendor lock-in**: No external services, APIs, or accounts needed
- **Minimal footprint**: All CMS code lives in a single `/snack` folder to avoid cluttering the user's project

### MVP Architecture

When a user runs `npx snack@latest init`, they get:
```
app/
  api/
    snack/
      [...path]/
        route.ts         # Single dynamic route handler for all CMS operations
  studio/                # Optional admin UI
    [[...path]]/
      page.tsx          # Studio UI with catch-all routing
lib/
  snack/                # All CMS code contained here
    core/
      db.ts            # SQLite setup and connection
      storage.ts       # Storage adapter
      handlers.ts      # CRUD operations
    schemas/
      index.ts         # User-defined content schemas
    auth/
      middleware.ts    # Simple auth (bearer token/basic auth)
    config.ts          # CMS configuration
public/
  uploads/             # Local file storage (images, documents)
snack.db              # SQLite database file
```

### What We're Building (MVP)

**Phase 1: Core Functionality**
1. ✅ SQLite storage layer (DONE)
2. ❌ API route handler (`createRouteHandler`) that provides:
   - GET /api/snack/[schema] - List all items
   - GET /api/snack/[schema]/[id] - Get single item
   - POST /api/snack/[schema] - Create item
   - PUT /api/snack/[schema]/[id] - Update item
   - DELETE /api/snack/[schema]/[id] - Delete item
   - POST /api/snack/upload - File upload
3. ❌ Schema helpers (`defineSchema`) for type-safe content modeling
4. ❌ Basic auth middleware (start with bearer token)

**Phase 2: Studio Integration**
1. ❌ Connect Studio UI to API routes
2. ❌ Dynamic forms based on schemas
3. ❌ File upload UI
4. ❌ Content list/grid views with filtering

**Phase 3: CLI Transformation**
1. ❌ Refactor CLI to copy templates instead of installing packages
2. ❌ Add `components.json` style configuration
3. ❌ Template system for different features (auth, storage adapters, etc.)

### File Handling Strategy
- **Phase 1**: Local filesystem in `public/uploads`
- **Phase 2**: Image optimization with Next.js Image
- **Future**: Pluggable adapters for S3, Cloudflare R2, Vercel Blob

## Essential Commands

### Development
```bash
pnpm dev          # Start all development servers (core, cli, studio, website)
pnpm build        # Build all packages
pnpm test         # Run all tests
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Lint all packages
pnpm format       # Format code with Prettier
```

### Package-Specific Development
```bash
# Run from root directory
pnpm --filter @snack/core dev       # Core package development
pnpm --filter @snack/studio dev     # Studio development server
pnpm --filter website dev           # Website development server
pnpm --filter @snack/cli build      # Build CLI

# Run specific tests
pnpm --filter @snack/core test      # Test core package only
```

## Architecture Overview

### Monorepo Structure
```
apps/
  website/        # Next.js 15 marketing/docs site
packages/
  core/          # CMS core logic, storage, schemas
  cli/           # Command-line interface
  studio/        # Admin UI (React + Vite)
```

### Core Package Architecture

The core package (`@snack/core`) provides the CMS foundation:

1. **Storage Layer**: SQLite-based adapter with type-safe operations
   - Tables created dynamically from schemas
   - Auto-generated fields: `id` (UUID), `created_at`, `updated_at`
   - JSON/array fields serialized as TEXT

2. **Schema System**: Defines content types with Zod validation
   - Field types: string, number, boolean, date, json, array, enum, reference, media
   - Schema configuration drives table creation and validation

3. **CRUD Handlers**: Abstracted operations for all content types
   - Create, Read, Update, Delete, Query operations
   - Type-safe with full TypeScript support

Key entry point: `packages/core/src/index.ts` exports `createCMS()` factory function

### Studio Package Architecture

React-based admin UI (`packages/studio`) built with:
- **Vite** for development and building
- **React Router DOM** for client-side routing
- **Shadcn/ui components** (Radix UI + Tailwind CSS)
- **Mobile-responsive** sidebar navigation

Routes defined in `packages/studio/src/main.tsx`:
- `/` - Dashboard
- `/:document` - Document listing
- `/:category/:document` - Nested document views

### CLI Package

Command-line tool (`packages/cli`) with commands:
- `snack create [name]` - Create new project
- `snack init` - Initialize in existing project
- `snack add <feature>` - Add features (e.g., studio)

Entry point: `packages/cli/src/index.ts`

## Key Conventions

### Import Patterns
- Use `@/` alias for src directory imports in studio/website
- Explicitly mark type imports: `import type { ... }`
- Prefer named exports over default exports

### Testing
- Framework: Vitest with Node.js environment
- Test files: `*.test.ts` alongside source files
- Core package has comprehensive CRUD and schema validation tests

### Database Conventions
- UUID primary keys generated automatically
- Dates stored as ISO strings
- JSON/array fields serialized to TEXT
- Reference fields store foreign key IDs

### Type Definitions
Core types located in `packages/core/src/types/`:
- `config.ts` - SnackConfig type
- `schema.ts` - Schema and field definitions
- `storage.ts` - Storage adapter interface

## Development Tips

1. **Type Safety**: The project uses strict TypeScript. Always ensure proper typing.
2. **Monorepo Commands**: Use `pnpm --filter <package>` to run commands for specific packages
3. **Turbo Cache**: Build artifacts are cached. Use `turbo run build --force` to bypass cache
4. **Studio Development**: Changes to core package require rebuild for studio to reflect them
5. **Testing Changes**: Run `pnpm test` before committing to ensure nothing breaks

## Implementation Priorities

### Immediate Next Steps
1. **Create `createRouteHandler` function** in `packages/core/src/routes/index.ts`
   - Should return Next.js 14+ App Router compatible route handlers
   - Handle all CRUD operations through a single dynamic route
   - Include error handling and validation

2. **Create `defineSchema` helper** in `packages/core/src/schema/define.ts`
   - Type-safe schema definition with TypeScript inference
   - Should work similar to Zod but simpler for CMS use case

3. **Update CLI templates** to generate working code
   - Fix imports to use actual exported functions
   - Generate `/lib/snack` structure instead of scattered files

4. **Create Studio API client** in `packages/studio/src/lib/api.ts`
   - Fetch wrapper for CRUD operations
   - Type-safe based on schemas

### Key Constraints
- **Everything under `/snack`**: API routes, studio, all CMS code should be under snack folders to not clutter user's project
- **No external dependencies**: Only use what Next.js provides + SQLite
- **Copy, don't install**: CLI should copy code templates, not add npm dependencies
- **Working defaults**: Everything should work out of the box with sensible defaults

# Animations Guidelines
 
## Keep your animations fast
 
- Default to use `ease-out` for most animations.
- Animations should never be longer than 1s (unless it's illustrative), most of them should be around 0.2s to 0.3s.
 
## Easing rules
 
- Don't use built-in CSS easings unless it's `ease` or `linear`.
- Use the following easings for their described use case:
  - **`ease-in`**: (Starts slow, speeds up) Should generally be avoided as it makes the UI feel slow.
    - `ease-in-quad`: `cubic-bezier(.55, .085, .68, .53)`
    - `ease-in-cubic`: `cubic-bezier(.550, .055, .675, .19)`
    - `ease-in-quart`: `cubic-bezier(.895, .03, .685, .22)`
    - `ease-in-quint`: `cubic-bezier(.755, .05, .855, .06)`
    - `ease-in-expo`: `cubic-bezier(.95, .05, .795, .035)`
    - `ease-in-circ`: `cubic-bezier(.6, .04, .98, .335)`
 
  - **`ease-out`**: (Starts fast, slows down) Best for elements entering the screen or user-initiated interactions.
    - `ease-out-quad`: `cubic-bezier(.25, .46, .45, .94)`
    - `ease-out-cubic`: `cubic-bezier(.215, .61, .355, 1)`
    - `ease-out-quart`: `cubic-bezier(.165, .84, .44, 1)`
    - `ease-out-quint`: `cubic-bezier(.23, 1, .32, 1)`
    - `ease-out-expo`: `cubic-bezier(.19, 1, .22, 1)`
    - `ease-out-circ`: `cubic-bezier(.075, .82, .165, 1)`
 
  - **`ease-in-out`**: (Smooth acceleration and deceleration) Perfect for elements moving within the screen.
    - `ease-in-out-quad`: `cubic-bezier(.455, .03, .515, .955)`
    - `ease-in-out-cubic`: `cubic-bezier(.645, .045, .355, 1)`
    - `ease-in-out-quart`: `cubic-bezier(.77, 0, .175, 1)`
    - `ease-in-out-quint`: `cubic-bezier(.86, 0, .07, 1)`
    - `ease-in-out-expo`: `cubic-bezier(1, 0, 0, 1)`
    - `ease-in-out-circ`: `cubic-bezier(.785, .135, .15, .86)`
 
 
## Hover transitions
 
- Use the built-in CSS `ease` with a duration of `200ms` for simple hover transitions like `color`, `background-color`,`opacity`.
- Fall back to easing rules for more complex hover transitions.
- Disable hover transitions on touch devices with the `@media (hover: hover) and (pointer: fine)` media query.
 
## Accessibility
 
- If `transform` is use in the animation, disable it in the `prefers-reduced-motion` media query.
 
## Origin-aware animations
 
- Elements should animate from the trigger. If you open a dropdown or a popover it should animate from the button. Change `transform-origin` according to the trigger position.
 
## Performance
 
- Stick to opacity and transforms when possible. Example: Animate using `transform` instead of `top`, `left`, etc. when trying to move an element.
- Do not animate drag gestures using CSS variables.
- Do not animate blur values higher than 20px.
- Use `will-change` to optimize your animation, but use it only for: `transform`, `opacity`, `clipPath`, `filter`.
- When using Motion/Framer Motion use `transform` instead of `x` or `y` if you need animations to be hardware accelerated.
 
## Spring animations
 
- Default to spring animations when using Framer Motion.
- Avoid using bouncy spring animations unless you are working with drag gestures.
