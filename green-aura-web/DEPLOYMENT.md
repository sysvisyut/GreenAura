# Green Aura Web - Deployment Guide

This document lays out a robust, repeatable, and fault-tolerant deployment plan for the Next.js app in `green-aura-web` with multi-provider hosting and a clear disaster-recovery path.

## Overview

- App: Next.js 15 (App Router), React 19, Tailwind CSS
- Auth/Data: Supabase (client + middleware via `@supabase/ssr`)
- Build: `next build --turbopack`, Start: `next start`
- Critical envs: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Environments

- Production: `prod` (public)
- Staging: `staging` (pre-production verification)
- Preview: per-PR ephemeral previews (optional but recommended)

Use separate Supabase projects or separate schemas for `staging` vs `prod`. Never reuse production anon keys in non-prod.

## Environment Variables

Create `.env`, `.env.production`, `.env.staging` locally (never commit secrets):

```
NEXT_PUBLIC_SUPABASE_URL=...            # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...       # Supabase anon key
# Optional runtime tuning
# NEXT_TELEMETRY_DISABLED=1
```

Notes:

- `src/lib/supabaseClient.ts` requires both vars at runtime.
- `src/middleware.ts` uses the same vars for server-side auth/session.
- `next.config.mjs` reads `NEXT_PUBLIC_SUPABASE_URL` to allow images from your Supabase Storage host. Ensure the project URL is set prior to build.

## Static Assets

- Assets are under `public/`; they deploy with the app automatically on all targets.
- Remote images: Unsplash + Supabase Storage are allowed in `next.config.mjs`.

## Build and Run

- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start` (requires `PORT` when on Docker/VM platform)

Node version: Use the platform default for Next 15 (Node 18+). If needed, set `engines.node` in `package.json` or platform config.

---

## Primary Hosting Option A: Vercel (Recommended)

Vercel provides zero-config Next.js hosting with preview deployments.

### Steps

1. Import repository in Vercel
   - Framework: Next.js
   - Root directory: `green-aura-web`
2. Set Environment Variables (Project Settings → Environment Variables)
   - Add to Production, Preview, Development:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Build & Output
   - Build Command: `npm run build`
   - Output: auto (Next.js)
4. Image Optimization
   - `next.config.mjs` already permits Supabase domain dynamically.
5. Custom Domain
   - Add domain → Vercel-managed DNS or external DNS (create `CNAME` to `cname.vercel-dns.com`).
6. Previews
   - Enable preview deployments for PRs (default). Secrets must also be set in Preview env.

### Pros/Cons

- Pros: Native Next.js features, zero-config, fast global edge network, previews.
- Cons: Vendor lock-in; paid features for advanced traffic.

---

## Primary Hosting Option B: Netlify

Netlify supports Next.js 15 with Next Runtime.

### Steps

1. New Site → Import from Git
   - Base directory: `green-aura-web`
2. Build
   - Build command: `npm run build`
   - Publish directory: `.next` (Netlify auto-detects Next)
   - Enable Next Runtime (auto on modern Netlify).
3. Environment Variables (Site settings → Environment)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Domain
   - Use Netlify subdomain or add custom domain; set `CNAME` to Netlify.

### Pros/Cons

- Pros: Good DX, forms/redirects, global CDN.
- Cons: Some Next features may need Netlify adapters; SSR limits on free tiers.

---

## Primary Hosting Option C: Docker + Fly.io (or Render/Dokku)

Containerized deployment gives portability and solid DR options.

### Sample Dockerfile

Use this as a starting point in `green-aura-web` if containerizing:

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Next.js caches
RUN adduser -D nextjs
USER nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Next standalone starts with server.js in standalone bundle
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

Notes:

- Use Next.js standalone output by default in Next 15. If not enabled, add in `next.config.mjs`:

```js
// next.config.mjs
const nextConfig = {
  output: "standalone",
  images: {
    /* existing config */
  },
};
export default nextConfig;
```

- Provide env vars at runtime (Fly secrets, Render env, Dokku config vars).

### Fly.io Quick Start

1. `fly launch` in `green-aura-web` (select Dockerfile)
2. `fly secrets set NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
3. `fly deploy`
4. Map custom domain or use Fly-generated one; add `A/AAAA` or `CNAME` as instructed.

---

## Multi-Provider Strategy (Active/Passive)

To minimize downtime, deploy to two providers (e.g., Vercel primary + Netlify or Fly as secondary).

- Build parity: Ensure identical env vars and Node versions across providers.
- Automations:
  - CI builds the app once and (optionally) pushes to both providers via CLIs; or
  - Each provider auto-builds from Git with the same root/path.
- Health checks: Use `/api/health` (create a basic route if needed) returning 200 OK. Providers often have native health endpoints; for SSR apps, a simple page like `/` can be used.

### DNS Failover

- Use a managed DNS with health checks and failover (e.g., Cloudflare, Route 53, DNSimple):
  - Create primary `A`/`CNAME` pointing to Provider A.
  - Create secondary record to Provider B.
  - Enable active monitoring on Provider A; auto-failover to B upon health check failures.
- If DNS-level health checks aren’t available, use a traffic manager (Cloudflare Load Balancer) to origin-pool both deployments with health checks.

### Session/Auth Considerations

- Supabase handles auth; sessions are stored in cookies and backed by Supabase. No in-memory state on the web tier, so multi-host works without sticky sessions.
- Ensure both deployments share the same `NEXT_PUBLIC_SUPABASE_*` for the same environment.

---

## CI/CD Guidance (GitHub Actions)

Use a single workflow to validate, build, and deploy to multiple targets.

Create `.github/workflows/deploy.yml` at the repo root (not committed here yet):

```yaml
name: Deploy Web
on:
  push:
    branches: [master]
  pull_request:

jobs:
  build-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: green-aura-web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: green-aura-web/package-lock.json
      - run: npm ci --no-audit --no-fund
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build

  deploy-vercel:
    if: github.ref == 'refs/heads/master'
    needs: build-test
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: green-aura-web
    steps:
      - uses: actions/checkout@v4
      - run: npm ci --no-audit --no-fund
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      - name: Deploy to Vercel
        run: npx vercel deploy --prod --scope ${{ secrets.VERCEL_SCOPE }} --token ${{ secrets.VERCEL_TOKEN }} --cwd ./green-aura-web

  deploy-netlify:
    if: github.ref == 'refs/heads/master'
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Netlify
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        run: |
          npm --prefix green-aura-web ci --no-audit --no-fund
          npm --prefix green-aura-web run build
          npx netlify deploy --dir=green-aura-web/.next --prod --site $NETLIFY_SITE_ID
```

Secrets checklist:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `VERCEL_TOKEN` and optionally `VERCEL_SCOPE`
- `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`
- (If using Fly) `FLY_API_TOKEN`

---

## Monitoring, Logs, and Alerts

- Provider metrics: Enable logs and alerting (Vercel/Netlify dashboards, Fly logs).
- Uptime monitoring: Pingdom, UptimeRobot, or Cloudflare Health Checks on `/` or `/api/health`.
- Supabase: Monitor Auth and DB usage; enable row-level security policies and backup schedule.

---

## Disaster Recovery (DR) Playbook

- Source of truth: Git main branch + Supabase data.
- Application redeploy:
  1. If Provider A is down, manually fail traffic to Provider B using DNS or load balancer.
  2. If both are down, deploy Docker image to a third site (Fly/Render) using same envs.
- Supabase outage:
  - Read-only mode: If DB is degraded, show friendly error and retry (app already avoids in-memory state).
  - Backups: Ensure automated daily backups (Supabase PITR or scheduled backups). Practice restore in staging monthly.
- Secrets rotation: Rotate Supabase anon key if leaked; update secrets in all providers and redeploy.

---

## Operational Runbook

- Deploy to staging on every PR merge to `staging` branch; smoke-test login, cart, checkout flows.
- Promote to production by merging to `master` and letting CI deploy to Provider A and B.
- Verify:
  - Homepage renders
  - Auth login works
  - Product list and images load (Unsplash/Supabase)
  - Protected routes redirect appropriately (middleware)
- If an incident occurs, follow DR Playbook and post-incident retrospective.

---

## Local Troubleshooting

- Missing Supabase envs → auth fails; check console logs (logger present in code).
- Remote images blocked → confirm `NEXT_PUBLIC_SUPABASE_URL` set at build so `next.config.mjs` includes storage host.
- 404s on assets → confirm `public/` files and domain mappings.

---

## Appendices

- Key files:
  - `src/lib/supabaseClient.ts`
  - `src/middleware.ts`
  - `next.config.mjs`
  - `package.json`
- Useful CLIs:
  - Vercel: `npx vercel login`, `npx vercel --prod`
  - Netlify: `npx netlify login`, `npx netlify deploy`
  - Fly: `flyctl auth login`, `flyctl deploy`, `flyctl secrets set`
