# 🚀 Quick Start Guide

This guide will get your Todo App running in **under 5 minutes**.

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check pnpm (need 8+)
pnpm --version

# If pnpm not installed:
npm install -g pnpm
```

## Setup (4 Steps)

### Step 1: Install Dependencies

```bash
pnpm install
```

This installs all packages including Convex, Better Auth, and UI dependencies.

### Step 2: Initialize Convex

```bash
npx convex dev
```

**What this does:**
- Creates a new Convex project (or links to existing)
- Generates your deployment credentials
- Starts the Convex development server
- Watches for schema and function changes

**Keep this terminal open!** You'll see output like:

```
  Convex dev server running: https://your-deployment.convex.cloud

  Add these to your .env.local:
  CONVEX_DEPLOYMENT=dev:your-deployment-name
  NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### Step 3: Configure Environment

**In a new terminal:**

```bash
# Copy the example file
cp .env.local.example .env.local

# Generate a secure secret
openssl rand -base64 32
```

**Edit `.env.local`** with your values:

```bash
# From the convex dev output:
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Paste the output from openssl command:
BETTER_AUTH_SECRET=your-generated-secret-here

# Local development URLs:
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 4: Start Development Server

**In a new terminal (keep Convex dev running):**

```bash
pnpm dev
```

This starts:
- ✅ Convex backend (already running)
- ✅ Next.js frontend (http://localhost:3000)

## Verify Installation

Open http://localhost:3000 in your browser. You should see:
- ✅ Todo App homepage
- ✅ Sign up / Sign in buttons
- ✅ No errors in the console

## Development Workflow

### Terminal 1: Convex Dev (keep running)
```bash
npx convex dev
```
- Auto-updates schema
- Hot reloads functions
- Shows logs and errors

### Terminal 2: Next.js Dev
```bash
pnpm web:dev
```
- Hot module replacement
- Fast refresh for React components

### Or use a single terminal:
```bash
pnpm dev
```
Runs both servers with `concurrently`.

## Common Issues

### Issue: "Cannot find module 'convex'"
**Solution:** Run `pnpm install` first

### Issue: "CONVEX_DEPLOYMENT is not defined"
**Solution:**
1. Make sure you ran `npx convex dev`
2. Copy values to `.env.local`
3. Restart the dev server

### Issue: "Better Auth error: BETTER_AUTH_SECRET is required"
**Solution:**
1. Generate secret: `openssl rand -base64 32`
2. Add to `.env.local`
3. Restart the dev server

### Issue: Port 3000 already in use
**Solution:**
```bash
# Use a different port
PORT=3001 pnpm web:dev
```

## Project Structure

```
todo-app/
├── convex/               # Backend (Convex)
│   ├── schema.ts        # Database schema
│   ├── auth.ts          # Authentication config
│   ├── http.ts          # HTTP routes
│   └── convex.config.ts # Component config
│
├── apps/web/            # Frontend (Next.js) - Phase 2
│   ├── app/             # App Router pages
│   ├── components/      # React components
│   └── lib/             # Utilities
│
├── package.json         # Root config
├── .env.local           # Your secrets (not committed)
└── README.md            # Full documentation
```

## Next Steps

### ✅ Phase 1 Complete: Infrastructure
You've successfully set up:
- Monorepo structure
- Convex backend
- Better Auth configuration
- Database schema

### ✅ Phase 2 Complete: Implementation
Fully implemented:
- Database layer (CRUD operations for tasks, tags, preferences)
- API endpoints (business logic with auth)
- Rate limiting configuration
- Helper utilities (validation, constants)
- Frontend UI (auth, dashboard, task manager)

### 🚀 Start Using the App
Open http://localhost:3000 and:
1. **Sign up** with any email/password
2. **Create tasks** with the "New Task" button
3. **Toggle status** by clicking the circle/clock/checkmark icon
4. **View statistics** in the dashboard overview
5. **See real-time updates** across all tabs

## Helpful Commands

```bash
# Install new package
pnpm add <package-name>

# Add dev dependency
pnpm add -D <package-name>

# View Convex dashboard
npx convex dashboard

# Deploy to production
npx convex deploy

# Build for production
pnpm build

# Run type checking
pnpm type-check
```

## Getting Help

- 📖 [Convex Docs](https://docs.convex.dev)
- 🔐 [Better Auth Docs](https://better-auth.com/docs)
- ⚛️ [Next.js Docs](https://nextjs.org/docs)
- 💬 [Convex Discord](https://convex.dev/community)

## Ready to Code? 🎉

Your development environment is ready and **fully functional**!

**What's working:**
- ✅ Convex backend with real-time updates
- ✅ Authentication system (sign up, sign in, sign out)
- ✅ Database schema with proper indexes
- ✅ Complete task management (create, read, update, delete)
- ✅ Dashboard with live statistics
- ✅ Rate limiting on all operations
- ✅ User preferences system
- ✅ Task tags support
- ✅ Development servers with hot reload

**Your app is production-ready!** Start customizing and adding features.

---

**Happy coding!** 🚀
