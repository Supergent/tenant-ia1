# Convex Components Reference

This project uses **2 Convex Components** to provide authentication and API protection.

## Installed Components

### 1. Better Auth (`@convex-dev/better-auth`)

**Version**: `^0.9.5` (with `better-auth@^1.3.27`)

**Purpose**: Authentication and session management

**Configuration**: `convex/auth.ts`

**Features Enabled**:
- ✅ Email/Password authentication
- ✅ JWT sessions (30-day expiration)
- ✅ Convex database adapter
- ❌ Email verification (disabled - can enable)
- ❌ OAuth providers (can add Google, GitHub, etc.)

**Usage in Endpoints**:
```typescript
import { authComponent } from "../auth";

export const myQuery = query({
  handler: async (ctx) => {
    // Get current authenticated user
    const user = await authComponent.getAuthUser(ctx);

    // user._id is the Convex document ID
    // Use user._id for database relations and rate limiting
    return await Tasks.getTasksByUser(ctx, user._id);
  },
});
```

**Important**: The return type of `getAuthUser()` includes:
- `_id`: Convex document ID (type: `Id<"user">`) - **USE THIS**
- `userId?`: Optional Better Auth user ID string
- `email`, `name`, etc.: User profile fields
- `_creationTime`: Convex timestamp

**HTTP Routes**: Configured in `convex/http.ts`
- `POST /auth/signup` - Create account
- `POST /auth/login` - Sign in
- `POST /auth/logout` - Sign out
- `GET /auth/session` - Get session

**Environment Variables**:
```bash
BETTER_AUTH_SECRET=    # Generate with: openssl rand -base64 32
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Learn More**:
- [Better Auth Docs](https://better-auth.com/docs)
- [Convex Adapter Docs](https://better-auth.com/docs/adapters/convex)

---

### 2. Rate Limiter (`@convex-dev/rate-limiter`)

**Version**: `^0.2.0`

**Purpose**: Prevent API abuse with configurable rate limits

**Configuration**: `convex/rateLimiter.ts` (Phase 2)

**Usage Pattern**:
```typescript
import { rateLimiter } from "../rateLimiter";
import { authComponent } from "../auth";

export const createTask = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);

    // Rate limit: 10 requests per minute with burst capacity
    const status = await rateLimiter.limit(ctx, "createTask", {
      key: user._id,  // Use user._id as the rate limit key
    });

    if (!status.ok) {
      throw new Error(`Rate limit exceeded. Retry after ${status.retryAfter}ms`);
    }

    // Continue with operation...
    return await Tasks.createTask(ctx, { userId: user._id, ...args });
  },
});
```

**Rate Limit Types**:

1. **Token Bucket** (allows bursts):
   ```typescript
   {
     kind: "token bucket",
     rate: 10,           // 10 tokens per period
     period: MINUTE,     // Period duration
     capacity: 3         // Allow burst of 3 requests
   }
   ```

2. **Fixed Window** (hard limit):
   ```typescript
   {
     kind: "fixed window",
     rate: 100,          // Max 100 requests
     period: HOUR        // Per hour
   }
   ```

**Recommended Limits** (Phase 2 will configure):
- Create tasks: 10/minute (token bucket)
- Update tasks: 50/minute (token bucket)
- Delete tasks: 30/minute (token bucket)
- Free trial signup: 100/hour (fixed window)

**Methods**:
- `limit(ctx, name, { key })` - Consume tokens and check limit (use in mutations)
- `check(ctx, name, { key })` - Check limit without consuming (use in queries)

**Important**:
- Use `limit()` in **mutations** (has `runMutation()` in context)
- Use `check()` in **queries** (read-only, no `runMutation()`)
- Most queries don't need rate limiting

**Environment Variables**: None required

**Learn More**:
- [Rate Limiter Docs](https://docs.convex.dev/components/rate-limiter)

---

## Component Not Used (Available if Needed)

The following components were considered but not needed for this project:

### Workflows (`@convex-dev/workflow`)
**When to use**: External API integrations, durable operations
**Example**: Scraping, AI generation, third-party services
**Not needed**: This project has no external service integrations

### Autumn (`@useautumn/convex`)
**When to use**: Stripe payments, subscriptions, billing
**Example**: SaaS apps, premium features
**Not needed**: This is a free todo app

### Resend (`@convex-dev/resend`)
**When to use**: Email notifications, verification, newsletters
**Example**: Password reset, email verification
**Not needed**: Email verification disabled, no notifications needed

### Agent (`@convex-dev/agent`)
**When to use**: AI assistants, chatbots, LLM features
**Example**: AI-powered task suggestions
**Not needed**: No AI features in this version

### RAG (`@convex-dev/rag`)
**When to use**: Vector search, semantic search, embeddings
**Example**: Search knowledge base, document similarity
**Not needed**: Simple text-based task search is sufficient

### Aggregate (`@convex-dev/aggregate`)
**When to use**: Real-time analytics, metrics, leaderboards
**Example**: Task completion stats, user leaderboards
**Not needed**: Simple counting is sufficient

---

## Adding Components Later

If you need to add a component later:

### 1. Install NPM packages
```bash
pnpm add @convex-dev/workflow
# Add component-specific dependencies
```

### 2. Install Convex component
```bash
npx convex components install @convex-dev/workflow --save
```

### 3. Update `convex/convex.config.ts`
```typescript
import workflow from "@convex-dev/workflow/convex.config";

app.use(workflow);  // Add after betterAuth
```

### 4. Configure the component
Create setup file (e.g., `convex/workflows.ts`)

### 5. Update schema if needed
Add component-specific tables to `convex/schema.ts`

### 6. Add environment variables
Update `.env.local.example` and `.env.local`

---

## Component Architecture

All components follow this pattern:

1. **NPM Package**: Installed in `package.json`
2. **Convex Config**: Imported in `convex.config.ts`
3. **Setup File**: Configuration in `convex/[component].ts`
4. **Schema Tables**: Component-specific tables (if needed)
5. **Usage**: Import and use in endpoints

**Example**:
```
@convex-dev/better-auth
  ↓
convex.config.ts: app.use(betterAuth)
  ↓
convex/auth.ts: export const authComponent = createClient(...)
  ↓
convex/endpoints/tasks.ts: const user = await authComponent.getAuthUser(ctx)
```

---

## Best Practices

### 1. Component Ordering
Always use Better Auth **first** in `convex.config.ts`:
```typescript
app.use(betterAuth);      // MUST be first
app.use(rateLimiter);     // Then other components
app.use(workflow);
```

### 2. Rate Limiting Keys
Use `user._id` (not `user.userId`) for rate limit keys:
```typescript
// ✅ CORRECT
await rateLimiter.limit(ctx, "action", { key: user._id });

// ❌ WRONG - user.id doesn't exist
await rateLimiter.limit(ctx, "action", { key: user.id });
```

### 3. Query vs Mutation Rate Limiting
```typescript
// In mutations - use limit()
export const create = mutation({
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, "create", { key: user._id });
  }
});

// In queries - use check() or skip entirely
export const list = query({
  handler: async (ctx) => {
    // No rate limiting needed for reads
  }
});
```

### 4. Environment Variables
Always document in `.env.local.example`:
```bash
# Component Name (REQUIRED/OPTIONAL)
COMPONENT_API_KEY=
```

---

## Support & Documentation

- **Convex Components**: https://docs.convex.dev/components
- **Better Auth**: https://better-auth.com/docs
- **Rate Limiter**: https://docs.convex.dev/components/rate-limiter
- **All Components**: https://convex.dev/components

---

**Last Updated**: Phase 1 Infrastructure Generation
**Components Used**: 2 (Better Auth, Rate Limiter)
**Components Available**: 21+ (see Convex Components catalog)
