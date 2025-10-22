# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Warolabs.com is a Nuxt.js application focused on democratizing technology and AI knowledge through virtual events, workshops, and educational content. The platform serves Spanish-speaking audiences and includes lead capture, email marketing campaigns, and user management functionality.

## Development Commands

```bash
# Development server (runs on port 4000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Database operations
npm run db:generate    # Generate Drizzle migrations
npm run db:migrate     # Run database migrations

# Testing
npm run test          # Run Jest tests

# Check database connection
npm run check-db-url  # Verify DATABASE_URL environment variable
```

## Architecture

### Tech Stack
- **Frontend**: Nuxt 3 (Vue.js) with Server-Side Rendering
- **Backend**: Nuxt API routes with H3 event handlers
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with magic link authentication
- **Email**: AWS SES for transactional emails
- **Styling**: TailwindCSS with SCSS

### Database Schema
The application uses a comprehensive multi-tenant architecture. For detailed schema information, refer to `BASE_DATA_WAROLABS.txt` in the project root (gitignored).

#### Core Entities:
**User Management:**
- `profile` - Main user profiles with contact info, company details, and personal information
- `sessions` - User sessions for Better Auth
- `magic_tokens` - Passwordless authentication tokens
- `addresses` - User addresses (billing/shipping)

**Multi-tenancy:**
- `tenants` - Organizations/workspaces with slug-based routing
- `tenant_members` - User-tenant relationships with role-based access
- `tenant_invitations` - Pending tenant invitations with email tokens

**Content Management:**
- `articles` - Blog posts/articles with SEO metadata, multilingual support
- `images` - File storage metadata with MIME types and descriptions
- `profile_images` - User profile image associations
- `comments` - Comment system with emotional reactions and moderation
- `commentable_items` - Polymorphic comment associations

**E-commerce/Events:**
- `clusters` - Event/venue containers with legal info and settings
- `areas` - Event sections/areas with pricing and capacity
- `units` - Individual bookable units within areas
- `reservations` - Booking records with date ranges and status
- `reservation_units` - Junction table for unit reservations with transfer capabilities
- `cancellations` - Cancellation records with refund status

**Product Catalog:**
- `product` - Product definitions with pricing
- `product_drop` - Product collections/releases
- `product_variants` - SKU variations with attributes and inventory
- `product_images` - Product image associations
- `categories` - Product categorization

**Order Management:**
- `orders` - Purchase orders with tracking and analytics data
- `order_items` - Line items with pricing snapshots
- `order_status_history` - Order state change tracking
- `payments` - Payment processing with gateway integration
- `inventory_transactions` - Stock movement tracking

**Marketing & CRM:**
- `campaign` - Marketing campaign management
- `leads` - Lead capture with UTM tracking and analytics
- `campaign_leads` - Campaign-lead associations
- `templates` - Email template system
- `template_versions` - Template versioning
- `campaign_template_versions` - Campaign-template associations
- `email_opens` - Email open tracking for campaigns with IP and user agent data
- `email_clicks` - Email click tracking for campaigns with original URLs and analytics
- `lead_interactions` - Unified tracking of all lead behavior and journey stages
- `lead_groups` - Smart lead segmentation based on behavior and engagement
- `lead_group_members` - Lead-group associations for targeted campaigns

**Pricing & Promotions:**
- `promotions` - Discount system targeting various entities
- `sale_stages` - Time-based pricing tiers
- `legal_info` - Company legal information for events

**Misc:**
- `unit_transfer_log` - Unit ownership transfer history
- `cluster_images` - Event/venue image associations
- `reservation_unit_qr_images` - QR code images for reservations

### API Structure
API routes are organized under `server/api/` with the following pattern:
- `/api/auth/` - Authentication endpoints (magic links, tokens)
- `/api/campaign/` - Email campaign management
- `/api/marketing/` - Marketing and lead capture
- `/api/profiles/` - User profile management
- `/api/landings/` - Landing page data

### Key Utilities
- `server/utils/basedataSettings/withPostgresClient.js` - Database connection wrapper
- `server/utils/aws/sesClient.js` - AWS SES email sending
- `server/utils/security/` - JWT verification and authorization
- `server/utils/emailTemplates/` - Email template rendering

## Configuration

### Database Schema Reference
The complete database schema dump is available in `BASE_DATA_WAROLABS.txt` in the project root. This file contains:
- Complete table definitions with all columns and data types
- Primary key, foreign key, and unique constraints
- Indexes for performance optimization
- Sample data insertions
- **Note**: This file is gitignored for security and should not be committed to the repository

### Environment Variables
The application requires these environment variables (see `nuxt.config.ts`):
- Database: `DATABASE_URL`, `NUXT_PRIVATE_DB_*`
- AWS SES: `NUXT_PRIVATE_AWS_*`
- Authentication: `NUXT_PRIVATE_JWT_SECRET`, `AUTH_SECRET`
- Application: `NUXT_PUBLIC_BASE_URL`

### Nuxt Configuration
- Runs on port 4000 in development
- Uses node-server preset for production
- Configured for Spanish language (`lang: 'es'`)
- Includes robots.txt configuration blocking AI crawlers from `/api/*`

## Development Patterns

### API Route Pattern
API routes use H3 event handlers with this structure:
```javascript
import { defineEventHandler, readBody } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';

export default defineEventHandler(async (event) => {
  // Authentication check
  await verifyAuthToken(event);
  
  // Get request body
  const body = await readBody(event);
  
  // Database operations
  const result = await withPostgresClient(async (client) => {
    return await client.query(/* SQL */);
  });
  
  return { success: true, data: result };
});
```

### Database Operations Policy
**ALWAYS prefer PostgreSQL functions over multiple queries within endpoints.** Never write complex database logic directly in API routes.

Rules:
- Create stored functions for any database operation that requires multiple queries or complex logic
- API endpoints should primarily call single PostgreSQL functions, not execute multiple raw queries
- Functions should handle transaction management, error handling, and data validation internally
- Use functions for operations like: creating template pairs, updating campaigns, complex data aggregations
- Keep API route database calls simple and focused on single function calls
- Functions should return structured data that can be directly used by the API response

Examples:
- GOOD: `client.query('SELECT * FROM update_campaign_templates($1, $2, $3)', [param1, param2, param3])`
- BAD: Multiple separate `client.query()` calls within a single endpoint for related operations
- GOOD: `client.query('SELECT * FROM create_template_pair($1, $2, $3)', [name, email, content])`
- BAD: Separate INSERT statements for templates, template_versions, and related tables in the API route

### ACID Methodology & Data Integrity
**CRITICAL: ALWAYS follow ACID principles to prevent data duplication and ensure consistency.**

**Atomicity Rules:**
- All related database operations MUST be wrapped in transactions
- Either ALL operations succeed or ALL fail - no partial states
- Use PostgreSQL functions with proper transaction handling
- Never leave the database in an inconsistent state

**Consistency Rules:**
- Enforce data integrity through foreign key constraints
- Use normalized table structures to prevent duplication
- Validate data at the database level, not just application level
- Maintain referential integrity across all related tables

**Isolation Rules:**
- Handle concurrent operations safely with proper locking
- Use appropriate transaction isolation levels
- Prevent race conditions in multi-user scenarios
- Test concurrent access patterns thoroughly

**Durability Rules:**
- Ensure committed transactions are permanently stored
- Handle connection failures gracefully
- Implement proper error handling and rollback mechanisms
- Use database constraints to prevent invalid data states

**Anti-Duplication Strategy:**
- **NEVER store the same information in multiple places**
- Use foreign keys instead of duplicating data
- Create separate normalized tables for different entity types
- Implement proper cascading updates/deletes
- Use views or computed columns for derived data

**Table Design Principles:**
- One table per entity type (person, artist, bar, business)
- Reference the main `profile` table via foreign keys
- Store type-specific data only in respective tables
- Use ENUM types for controlled vocabularies
- Implement proper indexing for performance

Examples:
- GOOD: `profile` → `artist_profiles` (1:1 relationship via foreign key)
- BAD: Storing artist data in a JSONB field in the main profile table
- GOOD: Separate `bar_amenities` table with foreign key to `bar_profiles`
- BAD: Storing amenities as JSON array in bar_profiles table

### Email Template Rendering
Email templates use Handlebars-style variable substitution:
```javascript
const renderTemplate = (template, data) => {
  return template.replace(/\{\{([a-zA-Z0-9\p{L}_ ]+)\}\}/gu, (match, key) => {
    const trimmedKey = key.trim();
    const value = data[trimmedKey];
    return value !== null && value !== undefined ? value : '';
  });
};
```

### Component Organization
- `components/Commons/` - Shared UI components
- `components/Landings/` - Landing page specific components  
- `components/Marketing/` - Marketing and lead capture components
- `pages/` - Route pages with Vue components
- `layouts/` - Page layouts

## Testing
The project uses Jest for testing. Test files are located in the `test/` directory.

## Docker Support
Includes Docker configuration with:
- `Dockerfile` for containerization
- `docker-compose.yml` for local development
- `docker-compose.override.yml` for environment-specific overrides

# Important Instruction Reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## UI/UX Guidelines

### Design System Compliance
**CRITICAL: ALWAYS follow the centralized design system.** Every component must use the established design tokens and component classes.

Rules:
- **NEVER hardcode colors** - Use design tokens from `tailwind.config.js` (e.g., `text-primary`, `bg-success`, `border-destructive`)
- **ALWAYS use component classes** from `/assets/css/components.css` (e.g., `btn-primary`, `card-base`, `modal-content`)
- **Follow existing patterns** - Study similar components before creating new ones
- **Use centralized spacing** - Use design tokens for padding, margins, and sizing (e.g., `p-card`, `gap-component`)
- **Maintain consistency** - Colors, typography, shadows, and animations should be uniform across all components

Examples:
- GOOD: `class="btn-primary text-primary bg-primary-50"`
- BAD: `class="bg-blue-500 text-white px-4 py-2 rounded"`
- GOOD: `class="card-base border-border"`
- BAD: `class="bg-white border border-gray-200 rounded-lg shadow"`

**Before creating any component:**
1. Check `tailwind.config.js` for available design tokens
2. Review `/assets/css/components.css` for reusable classes
3. Examine similar existing components for patterns
4. NEVER introduce new hardcoded values without updating the design system first

### Icons
**ALWAYS use Heroicons for all UI icons.** NEVER use inline SVG icons, emojis as icons, or other icon libraries unless explicitly requested by the user. 
When you need an icon, use Heroicons components or classes, not inline SVG code.

Examples:
- GOOD: `<Icon name="heroicons:home" />` or appropriate Heroicons component
- BAD: `<svg class="w-6 h-6" fill="none" stroke="currentColor">...</svg>`
- BAD: `📧` or other emoji as functional icons

### Component Architecture
**ALWAYS componentize reusable UI elements.** Never duplicate code between pages or components.

Rules:
- Create reusable components for any UI element that appears in multiple places
- Components should be placed in appropriate directories (`/components/Commons/`, `/components/Marketing/`, etc.)
- Use proper component naming with PascalCase (e.g., `CampaignCard.vue`, `StatCard.vue`)
- Components should be self-contained with their own props, emits, and styles

### Design Tokens & Centralized Styling System
**ALWAYS use the centralized design token system for consistent styling.** Never use hardcoded values for border radius, typography, or other design properties.

**Border Radius Design Tokens:**
```css
:root {
  --border-radius-default: 0.5rem; /* 8px - equivalent to rounded-lg */
  --border-radius-small: 0.25rem;  /* 4px - equivalent to rounded */
  --border-radius-large: 0.75rem;  /* 12px - equivalent to rounded-xl */
}
```

**Typography Design Tokens:**
```css
:root {
  /* Font Families */
  --font-primary: 'Lato', sans-serif;
  --font-secondary: 'Instrument Serif', serif;
  --font-mono: 'ui-monospace', 'SFMono-Regular', 'Consolas', monospace;
  
  /* Font Sizes */
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.125rem;  /* 18px */
  --font-size-xl: 1.25rem;   /* 20px */
  --font-size-2xl: 1.5rem;   /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */
  --font-size-4xl: 2.25rem;  /* 36px */
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
  
  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

**Global Automatic Application:**

**Border Radius System:**
All UI elements automatically receive centralized border radius:
```css
button, .btn-base, input, select, textarea, .card-base, 
[class*="modal"], [class*="dropdown"], .border, [class*="border-"] {
  border-radius: var(--border-radius-default) !important;
}
```

**Typography System:**
All elements automatically receive the primary font family (excludes landing/home pages):
```css
/* Primary font for ALL UI elements - headings, text, buttons, inputs, etc. */
body:not(.landing-page):not(.home-page), button, input, select, textarea, 
p, span, div, label, h1, h2, h3, h4, h5, h6, .section-title, .modal-title {
  font-family: var(--font-primary) !important;
}

/* Secondary font only for specific elements that need it */
.font-secondary {
  font-family: var(--font-secondary) !important;
}

/* Monospace for code */
code, .font-mono, pre {
  font-family: var(--font-mono) !important;
}
```

**Critical Rules:**
- **NEVER** use hardcoded Tailwind classes (`rounded-lg`, `text-lg`, `font-sans`, etc.) for design tokens
- **NEVER** use hardcoded font families (`font-['Lato']`, etc.)
- Let the global CSS selectors handle styling automatically  
- Elements automatically get appropriate fonts and border radius
- To change design tokens globally, modify only the CSS custom properties in `/assets/css/components.css`
- The system captures: buttons, inputs, selects, textareas, cards, modals, dropdowns, headings, and any element with border classes

**Landing/Home Page Exception:**
- Add `class="landing-page"` or `class="home-page"` to the body of landing/home pages to preserve custom typography
- This prevents the automatic font application for pages with established branding
- Use these classes for pages like `/` (home) or any custom landing pages that need specific typography

**What Gets Automatic Border Radius:**
- All `button` elements
- All form inputs (`input`, `select`, `textarea`)
- All elements with `.border` class
- All elements with border-related classes (`border-border`, `border-destructive`, etc.)
- All cards (`.card-base`)
- All modals and dropdowns
- Custom component base classes (`.btn-base`, `.input-base`)

**Typography Classes Available:**
- **Semantic Classes**: `.heading-primary`, `.heading-secondary`, `.heading-tertiary`, `.body-large`, `.body-regular`, `.body-small`, `.caption`
- **Utility Classes**: `.text-xs` through `.text-4xl`, `.font-light` through `.font-bold`, `.leading-tight` through `.leading-loose`
- **Font Family Classes**: `.font-primary`, `.font-secondary`, `.font-mono`

**Examples:**
- ✅ GOOD: `<div class="border border-border">` (automatically gets border radius)
- ✅ GOOD: `<h2 class="heading-secondary">` (automatically gets secondary font + proper sizing)
- ✅ GOOD: `<p class="body-regular">` (uses design tokens)
- ✅ GOOD: `<input class="input-base">` (automatically gets border radius + primary font)
- ❌ BAD: `<div class="border border-border rounded-lg">` (hardcoded border radius)
- ❌ BAD: `<h2 class="text-2xl font-serif">` (hardcoded typography)
- ❌ BAD: `<p class="font-['Lato'] text-base">` (hardcoded font family)
- ❌ BAD: `<UiCard class="rounded-xl">` (hardcoded, conflicts with system)

**System Benefits:**
- **Consistency**: All UI elements have the same styling without manual class application
- **Maintainability**: Change CSS variables to update styling globally
- **Automatic**: No need to remember to add styling classes to common elements
- **Comprehensive**: Covers all common UI elements and styling scenarios
- **Scalable**: Easy to extend with new design tokens
- **Semantic**: Meaningful class names that describe purpose, not appearance

### Loading States
**ALWAYS use appropriate loading components based on context.** Never use timeouts for loading simulation.

Rules:
- Use `CommonsTheLoading.vue` for page-level loading (no overlay needed)
- Use `<Teleport to="body">` for loading overlays only when covering viewport
- **CRITICAL**: Loading states MUST depend on actual data request states, never setTimeout() or artificial delays
- Loading should reflect real API calls, composable states, or data fetching operations
- Use consistent loading animations across the application
- Page loading: `<CommonsTheLoading />` inside conditional rendering
- Overlay loading: `<Teleport to="body"><LoadingOverlay /></Teleport>` for modal/popup contexts

### Data Management and API Calls
**ALWAYS prioritize Nuxt's built-in composables over manual implementations.** Never duplicate API calls or data fetching logic.

Rules:
- Use `useFetch()` instead of `$fetch()` for automatic SSR, caching, and loading states
- Use `useLazyFetch()` for client-side only data fetching
- Create composables for shared data logic (e.g., `useTemplates()`, `useCampaigns()`)
- Use Pinia stores for global state that needs to persist across components
- Eliminate duplicate API calls - centralize data fetching
- Data should load immediately on component mount, not after loading screens
- Use Nuxt's reactive data to eliminate blank screens between loading and content

Examples:
- GOOD: `<Teleport to="body"><LoadingOverlay v-if="loading" /></Teleport>`
- BAD: `<div v-if="loading" class="spinner">Loading...</div>`

## Lead Management & Marketing Automation

### Lead Journey Tracking System

The application implements a comprehensive lead tracking system that captures every interaction and enables intelligent segmentation:

#### Lead Interaction Types
- **`lead_capture`** - Initial lead capture from campaigns
- **`email_sent`** - Email delivery tracking
- **`email_open`** - Email opening behavior
- **`email_click`** - Link click behavior
- **`conversion`** - Goal completion events

#### Lead Segmentation with Groups

Lead groups enable intelligent segmentation based on behavior patterns and campaign engagement:

**Group Creation Criteria:**
- **Engagement Level**: Opens, clicks, interaction frequency
- **Campaign Context**: Source campaign, UTM parameters
- **Conversion Status**: Verified, converted, or pending leads
- **Time-based Filters**: Recent activity, lead age
- **Behavioral Patterns**: Active, inactive, highly engaged

**Group Functionality:**
1. **Smart Segmentation**: Automatic grouping based on behavior
2. **Targeted Campaigns**: Send specific content to relevant segments
3. **Lead Nurturing**: Progressive engagement based on interaction level
4. **Performance Tracking**: Conversion rates and ROI by segment
5. **A/B Testing**: Test different approaches per group

#### Marketing Workflow

**Optimal Email Campaign Flow:**
```
Templates → Campaigns → Lead Capture → Behavioral Tracking → Group Assignment → Targeted Sending
```

**Use Cases:**
- **Cold Reactivation**: Target inactive leads with re-engagement content
- **Warm Nurturing**: Progressive education for interested leads  
- **Hot Pursuit**: Direct offers for highly engaged leads
- **Post-conversion**: Upselling to converted customers

#### Implementation Benefits
- **Higher Engagement**: Relevant content increases open/click rates
- **Better Deliverability**: Reduced spam complaints through targeting
- **Improved ROI**: Focus resources on qualified segments
- **Automated Scaling**: Systematic approach to lead management
- **Data-Driven Decisions**: Clear metrics for optimization

### Sender Configuration

The email sender should operate on the **Campaign → Group → Send** model rather than direct campaign sending, enabling:
- Precise audience targeting based on behavior
- Automated segmentation workflows
- Performance optimization by group
- Scalable email marketing operations