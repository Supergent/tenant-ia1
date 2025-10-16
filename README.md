# Todo App

A simple, user-focused todo list application with authentication and real-time updates. Each user has a private todo list that syncs across devices using Convex's real-time backend.

## Features

- 🔐 **Secure Authentication** - Email/password authentication with Better Auth
- ✅ **Real-time Updates** - Changes sync instantly across all devices
- 🏷️ **Task Organization** - Tags, priorities, and status tracking
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Built with Radix UI and Tailwind CSS
- 🚀 **Performance** - Rate limiting and optimized queries

## Architecture

This project follows the **four-layer Convex architecture pattern**:

1. **Database Layer** (`convex/db/`) - Pure CRUD operations
2. **Endpoint Layer** (`convex/endpoints/`) - Business logic and API
3. **Workflow Layer** (`convex/workflows/`) - External integrations (if needed)
4. **Helper Layer** (`convex/helpers/`) - Pure utility functions

### Tech Stack

- **Backend**: [Convex](https://convex.dev) - Real-time backend with TypeScript
- **Frontend**: [Next.js 15](https://nextjs.org) - React framework with App Router
- **Authentication**: [Better Auth](https://better-auth.com) - Secure authentication
- **UI**: [Radix UI](https://radix-ui.com) + [Tailwind CSS](https://tailwindcss.com)
- **Icons**: [Lucide React](https://lucide.dev)

### Convex Components

This project uses the following Convex components:

- **Better Auth** (`@convex-dev/better-auth`) - Authentication and session management
- **Rate Limiter** (`@convex-dev/rate-limiter`) - API rate limiting to prevent abuse

## Prerequisites

- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0 or higher
- A [Convex account](https://convex.dev) (free)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Convex

```bash
npx convex dev
```

This will:
- Create a new Convex project (or link to an existing one)
- Generate your `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`
- Start the Convex development server

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local` and fill in the required values:

```bash
# From the convex dev output:
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-generated-secret

# Your local URL (change in production)
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Start Development Server

```bash
# In a new terminal (keep convex dev running)
pnpm dev
```

This starts both:
- Convex backend (port 3210)
- Next.js frontend (port 3000)

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Project Structure

```
.
├── apps/
│   └── web/                    # Next.js frontend application
│       ├── app/                # App Router pages
│       ├── components/         # React components
│       ├── lib/                # Utilities and auth clients
│       └── providers/          # React context providers
├── convex/
│   ├── schema.ts               # Database schema
│   ├── convex.config.ts        # Component configuration
│   ├── auth.ts                 # Better Auth setup
│   ├── http.ts                 # HTTP routes
│   ├── rateLimiter.ts          # Rate limit configuration
│   ├── db/                     # Database layer ✅
│   │   ├── tasks.ts            # Task CRUD operations
│   │   ├── taskTags.ts         # Tag CRUD operations
│   │   ├── userPreferences.ts  # Preferences CRUD
│   │   └── dashboard.ts        # Dashboard queries
│   ├── endpoints/              # API endpoints ✅
│   │   ├── tasks.ts            # Task management API
│   │   ├── tags.ts             # Tag management API
│   │   ├── preferences.ts      # Preferences API
│   │   └── dashboard.ts        # Dashboard API
│   └── helpers/                # Utility functions ✅
│       ├── validation.ts       # Input validation
│       └── constants.ts        # App constants
├── packages/                   # Shared packages (if needed)
└── planning/                   # Design system theme
```

## Development Scripts

```bash
# Start both Convex and Next.js
pnpm dev

# Start only Next.js
pnpm web:dev

# Start only Convex
pnpm convex:dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Type check
pnpm type-check
```

## Database Schema

### Tables

- **tasks** - User todo items with status, priority, and due dates
- **taskTags** - Custom tags for organizing tasks
- **userPreferences** - User-specific settings and preferences

All tables are user-scoped with proper indexes for efficient queries.

## Authentication

This app uses Better Auth with the Convex adapter:

- **Email/Password** - Standard authentication flow
- **JWT Sessions** - 30-day expiration
- **No Email Verification** - Disabled by default (can be enabled)

### Adding OAuth Providers

To add Google, GitHub, or other OAuth providers, edit `convex/auth.ts`:

```typescript
import { google, github } from "better-auth/providers";

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    // ... existing config
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
  });
};
```

## Rate Limiting

API endpoints are protected with rate limiting using token bucket algorithm:

- **Create tasks**: 30 per minute (burst capacity: 5)
- **Update tasks**: 60 per minute (burst capacity: 10)
- **Delete tasks**: 20 per minute (burst capacity: 3)
- **Create tags**: 20 per minute (burst capacity: 3)
- **Update preferences**: 10 per minute (burst capacity: 2)

Configure limits in `convex/rateLimiter.ts`.

## Design System

This project uses a custom design system based on the theme configuration in `planning/theme.json`:

- **Primary Color**: Indigo (`#6366f1`)
- **Secondary Color**: Sky Blue (`#0ea5e9`)
- **Accent Color**: Orange (`#f97316`)
- **Font**: Inter with Plus Jakarta Sans for headings
- **Tone**: Neutral with balanced density

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Deploy Convex

```bash
# Deploy to production
npx convex deploy
```

Update your production environment variables:
- `CONVEX_DEPLOYMENT=prod:your-deployment`
- `NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud`
- `SITE_URL=https://your-domain.com`

## Implementation Status

✅ **Phase 1: Infrastructure** - Complete
- Database schema defined
- Convex components configured
- Environment variables documented

✅ **Phase 2: Implementation** - Complete
- Database layer (CRUD operations for tasks, tags, preferences)
- Endpoint layer (business logic with auth and rate limiting)
- Helper layer (validation and constants)
- Frontend UI (auth, dashboard, task manager)

## Features Implemented

### Backend
- ✅ Task CRUD operations with status and priority
- ✅ Task tags for organization
- ✅ User preferences (theme, view mode, notifications)
- ✅ Dashboard analytics (task counts, recent activity)
- ✅ Rate limiting on all mutations
- ✅ User authentication and authorization

### Frontend
- ✅ Email/password authentication with sign up/sign in
- ✅ Dashboard with task statistics
- ✅ Task manager with create, update, delete
- ✅ Task status toggling (todo → in progress → completed)
- ✅ Priority badges and visual indicators
- ✅ Responsive design with shared component library
- ✅ Real-time updates across all views

## Next Steps

1. **Enhancements**: Add task tags UI, due date picker, task filtering
2. **Testing**: Add unit and integration tests
3. **Features**: Add task sharing, reminders, or recurring tasks
4. **Analytics**: Add productivity charts and insights

## Learn More

- [Convex Documentation](https://docs.convex.dev)
- [Better Auth Documentation](https://better-auth.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Radix UI Documentation](https://radix-ui.com/primitives)

## License

MIT
