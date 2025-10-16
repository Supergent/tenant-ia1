# Architecture Guide

This document explains the four-layer Convex architecture pattern used in this project.

## Overview

The application is organized into **four distinct layers**, each with a specific responsibility:

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js)              │
│  - Components                           │
│  - Hooks (useQuery, useMutation)        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Endpoint Layer (convex/endpoints/)   │
│  - Business logic                       │
│  - Authentication checks                │
│  - Rate limiting                        │
│  - Composes database operations         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Database Layer (convex/db/)          │
│  - ONLY place using ctx.db              │
│  - Pure async functions                 │
│  - CRUD operations                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Helper Layer (convex/helpers/)       │
│  - Pure utility functions               │
│  - NO database access                   │
│  - Validation, constants                │
└─────────────────────────────────────────┘
```

## Layer 1: Database Layer

**Location**: `convex/db/`

**Purpose**: The ONLY layer that directly accesses the database using `ctx.db`.

**Rules**:
- ✅ Use `ctx.db.query()`, `ctx.db.insert()`, `ctx.db.patch()`, `ctx.db.delete()`
- ✅ Export pure async functions
- ✅ Accept `QueryCtx` or `MutationCtx` as first parameter
- ❌ NO business logic
- ❌ NO authentication checks
- ❌ DO NOT export Convex queries/mutations

**Example**:
```typescript
// convex/db/tasks.ts
import { MutationCtx, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function createTask(
  ctx: MutationCtx,
  args: { userId: string; title: string }
) {
  return await ctx.db.insert("tasks", {
    ...args,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function getTasksByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
}
```

## Layer 2: Endpoint Layer

**Location**: `convex/endpoints/`

**Purpose**: Business logic, authentication, and API surface.

**Rules**:
- ✅ Import and call database layer functions
- ✅ Handle authentication (authComponent.getAuthUser)
- ✅ Apply rate limiting
- ✅ Validate input
- ✅ Export Convex queries and mutations
- ❌ NEVER use `ctx.db` directly

**Example**:
```typescript
// convex/endpoints/tasks.ts
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import { Tasks } from "../db";

export const create = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    // 2. Rate limiting
    await rateLimiter.limit(ctx, "createTask", { key: authUser._id });

    // 3. Validation
    if (!args.title.trim()) throw new Error("Title required");

    // 4. Call database layer
    return await Tasks.createTask(ctx, {
      userId: authUser._id,
      title: args.title,
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    return await Tasks.getTasksByUser(ctx, authUser._id);
  },
});
```

## Layer 3: Helper Layer

**Location**: `convex/helpers/`

**Purpose**: Pure utility functions with no database or context access.

**Rules**:
- ✅ Pure functions (no side effects)
- ✅ NO `ctx` parameter
- ✅ NO database access
- ✅ Validation, formatting, constants

**Example**:
```typescript
// convex/helpers/validation.ts
export function isValidTaskTitle(title: string): boolean {
  return title.trim().length > 0 && title.length <= 200;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

```typescript
// convex/helpers/constants.ts
export const TASK_STATUSES = ["todo", "in_progress", "completed"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
```

## Layer 4: Workflow Layer (Optional)

**Location**: `convex/workflows/`

**Purpose**: Durable external service integrations.

**When to use**: Only when you need to integrate with external APIs (Stripe, OpenAI, email services, etc.)

**Pattern**: Three files per service:
1. `[service].ts` - Workflow definition
2. `[service]Steps.ts` - Internal Convex operations
3. `[service]StepsActions.ts` - External API calls with `"use node"`

## Data Flow Example

Let's trace how creating a task flows through the layers:

1. **Frontend** calls mutation:
   ```typescript
   const createTask = useMutation(api.endpoints.tasks.create);
   await createTask({ title: "Buy groceries" });
   ```

2. **Endpoint Layer** (`convex/endpoints/tasks.ts`):
   - Checks authentication
   - Applies rate limiting
   - Validates input
   - Calls database layer

3. **Database Layer** (`convex/db/tasks.ts`):
   - Inserts record into database
   - Returns the new task ID

4. **Frontend** receives the result and updates UI reactively

## Common Patterns

### Authentication

Always check authentication in the endpoint layer:

```typescript
const authUser = await authComponent.getAuthUser(ctx);
if (!authUser) {
  throw new Error("Not authenticated");
}
```

**Important**: Use `authUser._id` (the Convex document ID), not `authUser.userId`:

```typescript
// ✅ CORRECT
await rateLimiter.limit(ctx, "createTask", { key: authUser._id });
await Tasks.createTask(ctx, { userId: authUser._id, ...args });

// ❌ WRONG
await rateLimiter.limit(ctx, "createTask", { key: authUser.id });
```

### Rate Limiting

Apply rate limiting in mutations (not queries):

```typescript
// In mutation:
const status = await rateLimiter.limit(ctx, "createTask", {
  key: authUser._id,
});
if (!status.ok) {
  throw new Error(`Rate limit exceeded. Retry after ${status.retryAfter}ms`);
}

// In query (optional, use check() instead of limit()):
const status = await rateLimiter.check(ctx, "getTask", {
  key: authUser._id,
});
```

### Ownership Verification

Always verify ownership before update/delete:

```typescript
const task = await Tasks.getTaskById(ctx, args.id);
if (!task) {
  throw new Error("Task not found");
}
if (task.userId !== authUser._id) {
  throw new Error("Not authorized");
}
```

### Dynamic Table Queries

When querying multiple tables dynamically (e.g., in dashboard functions), use type assertion:

```typescript
import type { DataModel } from "../_generated/dataModel";

const TABLES = ["tasks", "taskTags", "userPreferences"] as const;

for (const table of TABLES) {
  // ✅ CORRECT - Use type assertion
  const records = await ctx.db.query(table as keyof DataModel).collect();

  // ❌ WRONG - TypeScript error
  const records = await ctx.db.query(table).collect();
}
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Type Safety**: Full TypeScript support across all layers
3. **Testability**: Pure functions are easy to test
4. **Maintainability**: Clear boundaries make code easy to understand
5. **Performance**: Optimized database operations in one place
6. **Security**: Authentication and authorization in one layer

## Anti-Patterns to Avoid

❌ **DON'T use `ctx.db` in the endpoint layer**:
```typescript
// ❌ BAD
export const create = mutation({
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", args); // WRONG!
  },
});

// ✅ GOOD
export const create = mutation({
  handler: async (ctx, args) => {
    return await Tasks.createTask(ctx, args); // Call db layer
  },
});
```

❌ **DON'T add business logic in the database layer**:
```typescript
// ❌ BAD
export async function createTask(ctx: MutationCtx, args: any) {
  const authUser = await authComponent.getAuthUser(ctx); // WRONG!
  return await ctx.db.insert("tasks", args);
}

// ✅ GOOD
export async function createTask(ctx: MutationCtx, args: { userId: string; ... }) {
  return await ctx.db.insert("tasks", args); // Just insert
}
```

❌ **DON'T export queries/mutations from the database layer**:
```typescript
// ❌ BAD
export const getTasks = query({ ... }); // WRONG!

// ✅ GOOD
export async function getTasksByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db.query("tasks")...
}
```

## Learn More

- [Convex Documentation](https://docs.convex.dev)
- [Better Auth with Convex](https://better-auth.com/docs/integrations/convex)
- [Rate Limiting Component](https://labs.convex.dev/rate-limiter)
