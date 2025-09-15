
# Ecozync

<p align="center">
  <img src="/public/logo.png" alt="Ecozync Logo" width="200" />
</p>

<p align="center">
  <strong>Social-first carbon tracking PWA with living interface design</strong>
</p>

<p align="center">
  A Progressive Web App that gamifies climate action through community engagement and biomorphic animations.
</p>

## Introduction

Ecozync transforms carbon tracking into an engaging social experience with a living interface that responds to user interactions through organic animations and nature-inspired design patterns.

### Core Features

#### 🌱 Carbon Calculator
- **8-Question Assessment**: Quick, engaging carbon footprint calculation
- **Local Calculation Engine**: Comprehensive emission factors from EPA, DEFRA, IPCC sources
- **Visual Results**: Interactive charts showing breakdown by category
- **Historical Tracking**: Month-over-month progress visualization

#### 🎮 Social Gamification
- **Achievement System**: Unlock badges for sustainable actions
- **Friend Connections**: Build a network of eco-conscious friends
- **Activity Feed**: See friends' achievements and milestones
- **Challenges**: Weekly and monthly community challenges
- **Leaderboards**: Compete in reduction percentages, not absolute values
- **Impact Sharing**: Share achievements on social media

#### 📱 Progressive Web App
- **Offline Support**: Core features available without connection
- **Install Prompts**: Native app-like installation on devices
- **Push Notifications**: Challenge reminders and achievement alerts
- **Background Sync**: Data syncs when connection restored

#### 🎨 Living Interface Design
- **Breathing Gradients**: Animated gradients that pulse with organic rhythm
- **Biomorphic Animations**: Nature-inspired motion patterns using Framer Motion
- **Organic Particles**: Floating elements that react to user interactions
- **Biomimicry Patterns**: UI elements inspired by natural forms (leaves, water, cells)

### Subscription Tiers

Equal-tier pricing focused on CO2 offset coverage:
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

## Tech Stack

### Foundation (Next.js SaaS Starter)
- **Framework**: Next.js 15 with App Router
- **Database & Auth**: Supabase (PostgreSQL + User Authentication)
- **Payments**: Stripe (Checkout, Subscriptions, Customer Portal)
- **Styling**: Tailwindcss (CSS framework)
- **Components**: shadcn/ui (Prebuilt accessible components)
- **Email**: React Email (Build emails) + Resend (Send emails)
- **Validation**: Zod (schema validation)

### Ecozync Additions
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

## Getting Started

### 1. Setup Environment Variables

Create a `.env.local` file in your root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_PASSWORD=your_db_password

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk
STRIPE_SECRET_KEY=your_stripe_sk
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Email
RESEND_API_KEY=your_resend_key

# Carbon APIs (Optional)
GOLD_STANDARD_API_KEY=your_gold_standard_key

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Ecozync
```

### 2. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to Project Settings → Database → Database password and reset it
3. Save the password for your environment variables

### 3. Setup Stripe

1. Go to [stripe.com](https://stripe.com) and create a project
2. Go to [Customer Portal Settings](https://dashboard.stripe.com/test/settings/billing/portal) and activate test link

### 4. Setup Resend

1. Go to [resend.com](https://resend.com) and create an account
2. Create an API Key from the [API Keys page](https://resend.com/api-keys)
3. Add the [Supabase Resend integration](https://supabase.com/partners/integrations/resend)

### 5. Setup Carbon Offset API (Optional)

1. **Gold Standard**: Register at [goldstandard.org](https://goldstandard.org) for verified carbon offset purchasing

### 6. Install Dependencies and Run

```bash
# Install dependencies
npm install

# Run Supabase migration
npm run supabase:link
npm run migration:up

# Load Stripe product data
stripe fixtures ./stripe-fixtures.json --api-key YOUR_STRIPE_SK

# Start development server
npm run dev
```

## Development Commands

### Core Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Email Development
```bash
npm run email:dev    # Start React Email dev server on port 3001
npm run email:build  # Build email templates
npm run email:export # Export email templates
```

### Database Management
```bash
npm run migration:new MIGRATION_NAME  # Create new migration
npm run migration:up                  # Apply migrations and regenerate types
npm run migration:squash              # Squash migrations
npm run generate-types                # Generate TypeScript types
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (account)/         # Account management pages
│   └── api/webhooks/      # Stripe webhook handlers
├── features/              # Feature-specific logic
│   ├── account/           # User account management
│   ├── emails/            # React Email templates
│   └── pricing/           # Product/pricing logic
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui generated components
├── libs/                 # External service integrations
│   ├── stripe/           # Stripe configuration
│   └── supabase/         # Supabase clients
└── styles/               # Global styles
```

## Carbon Calculation Engine

### Local Calculation Approach

Ecozync uses a comprehensive local calculation engine instead of external APIs, providing:

- **Instant Results**: No network latency or API rate limits
- **Complete Privacy**: No data sent to third parties
- **Cost-Effective**: No per-calculation costs
- **High Accuracy**: 90% confidence using scientific emission factors
- **Always Available**: Works offline and without external dependencies

### Emission Factors Database

Our calculation engine includes 500+ emission factors from trusted sources:

- **EPA 2023**: US Environmental Protection Agency data
- **DEFRA 2023**: UK Department for Environment, Food and Rural Affairs
- **IPCC 2014**: Intergovernmental Panel on Climate Change
- **Oxford University 2023**: Environmental Research Letters
- **European Environment Agency 2023**: EU grid electricity factors

### Coverage Areas

- **Energy**: Electricity, natural gas, oil, renewables by region
- **Transport**: Cars (petrol/diesel/electric/hybrid), public transport, active transport
- **Aviation**: Short/medium/long haul flights by class
- **Diet**: Vegan, vegetarian, pescatarian, omnivore annual emissions
- **Consumption**: Shopping frequency, electronics, clothing
- **Waste**: Recycling, composting, landfill management

## Design Philosophy

Ecozync embodies a "living interface" philosophy where:

- **Organic Motion**: All animations follow natural patterns found in biology
- **Responsive Ecosystems**: UI elements react to each other like organisms in nature
- **Breathing Rhythms**: Gradients and backgrounds pulse with calming, breath-like cycles
- **Growth Metaphors**: Progress visualizations use plant growth and natural expansion patterns
- **Environmental Harmony**: Color transitions mirror natural phenomena like sunrise, water flow, and forest depth

## Development Status

### ✅ Completed (Inherited from Starter)

#### Infrastructure & Foundation
- [x] **Next.js 15 App Router** - Modern React framework with file-based routing
- [x] **Supabase Integration** - PostgreSQL database with RLS and authentication
- [x] **Stripe Integration** - Payment processing, subscriptions, customer portal
- [x] **Authentication System** - Email/OAuth login with protected routes
- [x] **Database Schema** - Users, customers, products, prices, subscriptions tables
- [x] **Webhook System** - Stripe webhook handler for data synchronization
- [x] **Email System** - React Email templates with Resend integration
- [x] **shadcn/ui Components** - Accessible component library foundation
- [x] **Tailwind CSS** - Utility-first styling framework
- [x] **TypeScript** - Full type safety with strict mode
- [x] **Development Tools** - ESLint, Prettier, migrations, type generation

#### Ecozync Branding & Design
- [x] **Brand Identity** - Logo, colors, typography (Inter, Outfit, JetBrains Mono)
- [x] **Living Border Component** - Organic gradients with brand colors
- [x] **Dark Theme Foundation** - Primary dark (#0a1f1b) background
- [x] **Metadata & SEO** - OpenGraph, Twitter cards, PWA manifest setup
- [x] **Responsive Layout** - Mobile-first design with max-width container

### 🚧 In Progress

#### Design System Implementation
- [ ] **CSS Custom Properties** - Define all brand colors as CSS variables
- [ ] **Font Integration** - Ensure Outfit (headlines) and JetBrains Mono (data) are properly loaded
- [ ] **Component Variants** - Update all shadcn components with Ecozync theme

### 📋 To Build - Core Features

#### 🌱 Carbon Calculator System
- [x] **8-Question Assessment Flow**
  - [x] Multi-step form component with progress indicator
  - [x] Question types: transport, energy, diet, lifestyle, travel
  - [x] Input validation and user-friendly error handling
- [x] **Local Calculation Engine**
  - [x] Comprehensive emission factors database (500+ factors)
  - [x] EPA, DEFRA, IPCC, Oxford University data sources
  - [x] High accuracy calculation logic (90% confidence)
  - [x] Instant results without external API dependencies
- [x] **Results Visualization**
  - [x] Interactive results display with breakdown by category
  - [x] Comparison metrics (vs. EU/global averages, Paris targets)
  - [x] Social sharing capabilities
- [x] **Historical Tracking**
  - [x] Database schema for carbon footprint records
  - [x] Anonymous user support with localStorage
  - [x] Authenticated user data persistence

#### 🎮 Social Gamification
- [ ] **Achievement System**
  - [ ] Badge database schema and asset creation
  - [ ] Achievement logic and trigger system
  - [ ] Achievement unlock animations
- [ ] **Friend Connections**
  - [ ] Friend request/accept system
  - [ ] Friend discovery and search
  - [ ] Privacy controls for data sharing
- [ ] **Activity Feed**
  - [ ] Real-time feed with Supabase Realtime
  - [ ] Activity types: achievements, milestones, challenges
  - [ ] Feed filtering and pagination
- [ ] **Challenges System**
  - [ ] Weekly/monthly challenge creation
  - [ ] Challenge participation tracking
  - [ ] Group challenges and team formation
- [ ] **Leaderboards**
  - [ ] Reduction percentage calculations
  - [ ] Different leaderboard categories
  - [ ] Privacy-first approach (no absolute values)
- [ ] **Social Sharing**
  - [ ] Dynamic OG image generation
  - [ ] Platform-specific sharing (Twitter, Instagram, LinkedIn)
  - [ ] Achievement celebration animations

#### 🎨 Living Interface Design
- [ ] **Breathing Gradients**
  - [ ] CSS animations with organic rhythm
  - [ ] Gradient keyframes following natural patterns
  - [ ] Performance optimization for mobile
- [ ] **Biomorphic Animations** 
  - [ ] Framer Motion integration
  - [ ] Nature-inspired motion curves
  - [ ] Scroll-triggered animations
- [ ] **Organic Particles**
  - [ ] Canvas-based particle system
  - [ ] Mouse/touch interaction responses
  - [ ] Performance considerations for low-end devices
- [ ] **Biomimicry Patterns**
  - [ ] Leaf, water, and cell-inspired UI elements
  - [ ] SVG illustrations and micro-animations
  - [ ] Contextual animations based on user progress

#### 📱 Progressive Web App
- [ ] **Service Worker Setup**
  - [ ] next-pwa integration and configuration
  - [ ] Offline page and core feature caching
  - [ ] Background sync for data updates
- [ ] **Install Prompts**
  - [ ] Custom install promotion UI
  - [ ] Platform detection (iOS, Android, Desktop)
  - [ ] Install analytics tracking
- [ ] **Push Notifications**
  - [ ] Notification service setup
  - [ ] Challenge reminders and achievement alerts
  - [ ] User notification preferences
- [ ] **Offline Support**
  - [ ] Cache strategy for core features
  - [ ] Offline indicator and UX
  - [ ] Data synchronization when online

#### 💰 Subscription & Offset Integration
- [ ] **Equal-tier Pricing Model**
  - [ ] Update Stripe fixtures with €4.50/€9/€18 pricing
  - [ ] Tonnage-based subscription metadata
  - [ ] EU-specific tax and billing considerations
- [ ] **Gold Standard API Integration**
  - [ ] Verified carbon offset purchasing
  - [ ] Offset certificate generation
  - [ ] Offset tracking and history
- [ ] **Impact Visualization**
  - [ ] Real-time offset impact display
  - [ ] Visual representation of environmental impact
  - [ ] Offset project information and verification

### 🔮 Future Enhancements
- [ ] **Machine Learning Insights** - Personalized reduction recommendations
- [ ] **Corporate Partnerships** - Team challenges and enterprise features
- [ ] **IoT Integration** - Smart home and device connectivity
- [ ] **Marketplace** - Sustainable product recommendations
- [ ] **Educational Content** - Climate action guides and tips
- [ ] **Multi-language Support** - Internationalization for global reach

### 📊 Development Metrics
- **Foundation Complete**: 85% (inherited from starter)
- **Branding Complete**: 90% (core identity implemented)
- **Carbon Calculator**: 100% (core functionality complete)
- **Core Features Remaining**: Social Features → Living Interface → PWA
- **Estimated Development Time**: 8-12 weeks for full MVP
- **Priority Order**: Social Features → Living Interface → PWA → Advanced Features

---

## Contributing

We welcome contributions that align with our mission of making climate action engaging and accessible. Please ensure all code follows our design system principles and includes appropriate animations for the living interface.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the planet 🌍

