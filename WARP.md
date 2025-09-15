# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview: Ecozync

Ecozync is a social-first carbon tracking Progressive Web App that gamifies climate action through community engagement. The app features a living interface design with biomorphic animations and organic patterns that respond to user interactions.

### Business Model
Equal-tier subscription pricing focused on CO2 offset coverage:
- **3 Tonnes**: €4.50/month - Personal carbon offsetting
- **6 Tonnes**: €9/month - Extended household coverage
- **12 Tonnes**: €18/month - Full family impact offsetting

## Design System

### Color Palette
```css
:root {
  --primary-dark: #0a1f1b;      /* Deep forest green */
  --accent-green: #4ade80;      /* Living green */
  --accent-cyan: #22d3ee;       /* Water cyan */
  --surface-dark: #162420;      /* Elevated surfaces */
  --surface-darker: #0d1815;    /* Recessed surfaces */
  --text-primary: #f0fdf4;      /* High contrast text */
  --text-secondary: #86efac;    /* Muted green text */
}
```

### Typography
- **UI Text**: Inter - Clean, readable interface text
- **Headlines**: Outfit - Modern, friendly display font
- **Data/Metrics**: JetBrains Mono - Monospace for carbon calculations and statistics

### Living Interface Design
- **Breathing Gradients**: Animated gradients that pulse with organic rhythm
- **Biomorphic Animations**: Nature-inspired motion patterns using Framer Motion
- **Organic Particles**: Floating elements that react to user interactions
- **Biomimicry Patterns**: UI elements inspired by natural forms (leaves, water, cells)
- **Responsive Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: 1024px+

## Core Features

### Carbon Calculator
- **8-Question Assessment**: Quick, engaging carbon footprint calculation
- **Local Calculation Engine**: Comprehensive emission factors from EPA, DEFRA, IPCC sources
- **Visual Results**: Interactive charts showing breakdown by category
- **Historical Tracking**: Month-over-month progress visualization

### Social Gamification
- **Achievement System**: Unlock badges for sustainable actions
- **Friend Connections**: Build a network of eco-conscious friends
- **Activity Feed**: See friends' achievements and milestones
- **Challenges**: Weekly and monthly community challenges
- **Leaderboards**: Compete in reduction percentages, not absolute values
- **Impact Sharing**: Share achievements on social media

### Progressive Web App Features
- **Offline Support**: Core features available without connection
- **Install Prompts**: Native app-like installation on devices
- **Push Notifications**: Challenge reminders and achievement alerts
- **Background Sync**: Data syncs when connection restored

## Development Commands

### Core Development
```bash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

### Email Development
```bash
# Start React Email development server on port 3001
npm run email:dev

# Build email templates
npm run email:build

# Export email templates
npm run email:export
```

### Stripe Development
```bash
# Listen to Stripe webhooks locally (update project name first)
npm run stripe:listen

# Load initial product data into Stripe
stripe fixtures ./stripe-fixtures.json --api-key YOUR_STRIPE_SK
```

### Supabase Database Management
```bash
# Link to your Supabase project (update project ID in package.json first)
npm run supabase:link

# Create a new migration
npm run migration:new MIGRATION_NAME

# Apply migrations and regenerate TypeScript types
npm run migration:up

# Squash migrations
npm run migration:squash

# Generate TypeScript types from database schema
npm run generate-types
```

## Architecture Overview

### Tech Stack

#### EXISTING (from next-supabase-stripe-starter)
- **Framework**: Next.js 15 with App Router
- **Database & Auth**: Supabase (PostgreSQL + User Authentication)
- **Payments**: Stripe (Checkout, Subscriptions, Customer Portal)
- **Styling**: Tailwindcss (CSS framework)
- **Components**: shadcn/ui (Prebuilt accessible components)
- **Email**: React Email (Build emails) + Resend (Send emails)
- **Validation**: Zod (schema validation)
- **Infrastructure**:
  - Webhooks to sync Stripe with Supabase
  - Stripe fixture to bootstrap product data
  - Supabase migrations for database schema
  - Responsive, performant, accessible prebuilt pages

#### ADDITIONS FOR ECOZYNC
- **Animations**: Framer Motion (for biomorphic/living interface animations)
- **PWA**: next-pwa (offline support, install prompts, service workers)
- **State Management**: Zustand (for complex client state if needed)
- **Carbon Calculation**: 
  - Local calculation engine with 500+ emission factors
  - EPA, DEFRA, IPCC, and Oxford University data sources
  - Gold Standard API (verified carbon offset purchasing)
- **Real-time**: Supabase Realtime (for activity feeds, leaderboards)
- **Analytics**: Vercel Analytics + Web Vitals
- **Monitoring**: Sentry (error tracking)

#### CUSTOM IMPLEMENTATIONS
- Living gradient backgrounds with CSS animations
- Organic particle system with pure CSS/JS
- Breathing animations using CSS transforms
- Biomorphic synchronization patterns
- Social sharing with dynamic OG image generation
- Achievement celebration animations
- Progressive enhancement for mobile/tablet/desktop layouts

#### DEVELOPMENT APPROACH
- Use existing shadcn/ui components as base
- Extend with custom Tailwind classes for living interface
- Add Framer Motion for complex animations only
- Leverage existing Stripe webhook infrastructure
- Build on top of existing auth flow
- Extend database schema with migrations
- Use React Email templates for notifications

## Carbon Calculation Engine

### Local Calculation Approach

Ecozync uses a comprehensive local calculation engine that provides:

- **Instant Results**: No external API dependencies or network latency
- **Complete Privacy**: All calculations performed locally
- **High Accuracy**: 90% confidence using 500+ scientific emission factors
- **Cost-Effective**: No per-calculation API costs
- **Always Available**: Works offline and in any environment

### Implementation Details

- **Location**: `src/components/calculator/emission-factors.ts`
- **Data Sources**: EPA, DEFRA, IPCC, Oxford University (2014-2023)
- **Categories**: Energy, Transport, Aviation, Diet, Consumption, Waste
- **Calculation Engine**: `src/components/calculator/calculation-engine.ts`
- **Fallback Strategy**: Enhanced local → Legacy local calculations

### Usage in Development

```typescript
import { calculateEmissions } from '@/components/calculator/calculation-engine'

// All calculations are performed locally
const results = await calculateEmissions(userInputs)
// Returns EmissionCalculation with detailed breakdown
```

### Project Structure

The codebase follows a feature-based organization pattern:

- **`/src/app`**: Next.js App Router pages and layouts
  - `(auth)`: Authentication pages (login, signup, callback)
  - `api/webhooks`: Stripe webhook handler for syncing data
  - Layout includes persistent navigation and footer

- **`/src/features`**: Feature-specific logic colocated by domain
  - `account`: User account management and subscription controllers
  - `emails`: React Email templates
  - `pricing`: Product/pricing controllers and components

- **`/src/libs`**: External service integrations
  - `stripe`: Stripe admin client configuration
  - `supabase`: Server, admin, and middleware clients

- **`/src/components`**: Reusable UI components
  - `ui/`: shadcn/ui generated components

### Key Architectural Patterns

#### Database Synchronization
Products and prices are managed in Stripe and automatically synced to Supabase via webhooks. The webhook handler at `/api/webhooks` processes these Stripe events:
- Product creation/updates
- Price creation/updates
- Subscription lifecycle events
- Checkout session completion

#### Authentication Flow
1. Users authenticate via Supabase Auth (OAuth or magic link)
2. Auth callback at `/auth/callback` handles post-authentication routing
3. New users without subscriptions are redirected to pricing page
4. Authenticated users with subscriptions can access protected routes

#### Subscription Management
- Products defined in `stripe-fixtures.json` with metadata for features
- Three tiers: Basic ($5/mo), Pro ($10/mo), Enterprise (custom pricing)
- Metadata fields control features like generated images, editor access, and support level
- Customer portal integration for subscription management

#### Type Safety
- Database types generated from Supabase schema in `src/libs/supabase/types.ts`
- Product metadata validated with Zod schemas
- Full TypeScript coverage with strict mode enabled

### Environment Variables Required

Create a `.env.local` file in your project root with these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_DB_PASSWORD=your_database_password

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key

# Carbon APIs (Optional)
GOLD_STANDARD_API_KEY=your_gold_standard_api_key

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Ecozync

# Optional: Analytics and Monitoring
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_vercel_analytics_id
SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
```

### Database Schema
The application uses five main tables managed through Supabase migrations:
- **users**: Extended user profiles with billing info
- **customers**: Maps users to Stripe customer IDs
- **products**: Synced from Stripe products
- **prices**: Synced from Stripe prices
- **subscriptions**: Active user subscriptions

Row Level Security (RLS) policies ensure users can only access their own data.

### Common Development Patterns

#### Adding New Features to Products
1. Update metadata in `stripe-fixtures.json`
2. Run fixture command to update Stripe
3. Update Zod schema in `src/features/pricing/models/product-metadata.ts`
4. Use typed metadata in components

#### Creating New Database Tables
1. Create migration: `npm run migration:new table-name`
2. Define table structure with RLS policies in migration file
3. Run migration: `npm run migration:up`
4. Types automatically generated in `src/libs/supabase/types.ts`

#### Adding New Email Templates
1. Create component in `src/features/emails/`
2. Import React Email components and Tailwind config
3. Send via Resend client with typed props

### Important Configuration Notes
- Replace all instances of `UPDATE_THIS` with your actual values (search project-wide)
- Configure auth providers in Supabase dashboard
- Set up Stripe webhook endpoint with your deployment URL
- Enable Supabase Resend integration for email delivery
