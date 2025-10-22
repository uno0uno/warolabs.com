# Database Schema Documentation

## Overview
This document describes the current database structure for the Warolabs project based on analysis of the existing schema.

## Core Event System Tables

### clusters (Main Events Table)
Primary table for storing event/cluster information.

**Key Columns:**
- `id` (Primary Key) - Serial integer
- `profile_id` (Foreign Key) → `profile.id` - Event creator
- `cluster_name` - Event name (varchar 255)
- `description` - Event description (text)
- `start_date` - Event start time (timestamptz)
- `end_date` - Event end time (timestamptz)
- `cluster_type` - Event type/category (varchar 50)
- `slug_cluster` - URL-friendly slug (text)
- `legal_info_id` (Foreign Key) → `legal_info.id` - Legal information
- `is_active` - Active status (boolean)
- `shadowban` - Visibility control (boolean)
- `created_at` - Creation timestamp
- `updated_at` - Last modification timestamp

### areas
Table for storing geographical/category areas associated with events.

**Key Columns:**
- `id` (Primary Key) - Serial integer
- `cluster_id` (Foreign Key) → `clusters.id` - Associated event
- `area_name` - Name of the area
- `description` - Area description

**Important Note:** This is NOT `cluster_areas` - the correct table name is `areas`.

### cluster_images
Table for storing images associated with events.

**Key Columns:**
- `id` (Primary Key) - Serial integer
- `cluster_id` (Foreign Key) → `clusters.id` - Associated event
- `image_id` (Foreign Key) → `images.id` - Image reference
- `image_url` - Image URL
- `alt_text` - Alt text for accessibility
- `is_primary` - Primary image flag (boolean)

## Supporting Tables

### profile (Users)
User/profile information table.

**Key Columns:**
- `id` (Primary Key) - UUID - **Note: This is the primary key, NOT `profile_id`**
- `name` - User's name
- `email` - User's email
- `created_at` - Registration timestamp

**Important Note:** The primary key is `id`, and other tables reference this as their foreign key.

### legal_info
Legal information for events/organizations.

**Key Columns:**
- `id` (Primary Key) - Serial integer - **Note: This is the primary key, NOT `legal_info_id`**
- `nit` - Tax identification number
- Additional legal fields...

### tenant_members
Multi-tenancy user membership table.

**Key Columns:**
- `id` (Primary Key) - UUID
- `user_id` (Foreign Key) → `profile.id` - **Note: References `profile.id`, NOT `profile.profile_id`**
- `tenant_id` (Foreign Key) → `tenants.id` - Tenant reference
- `role` - User role in tenant
- `is_active` - Membership status

## Correct Table Relationships

### For Events Query:
```sql
-- Correct JOINs based on actual schema:
FROM clusters c
JOIN profile p ON c.profile_id = p.id          -- profile.id is the PK
LEFT JOIN legal_info li ON c.legal_info_id = li.id    -- legal_info.id is the PK  
LEFT JOIN areas a ON c.id = a.cluster_id              -- areas table, NOT cluster_areas
LEFT JOIN cluster_images ci ON c.id = ci.cluster_id   -- cluster_images table exists

-- Tenant isolation:
WHERE p.id IN (
  SELECT tm.user_id                             -- tm.user_id references profile.id
  FROM tenant_members tm 
  WHERE tm.tenant_id = ? AND tm.is_active = true
)
```

## Common Mistakes to Avoid

1. **Wrong table name**: `cluster_areas` doesn't exist - use `areas`
2. **Wrong primary key references**: 
   - `profile.profile_id` → Use `profile.id`
   - `legal_info.legal_info_id` → Use `legal_info.id`
3. **Wrong foreign key references**:
   - `tm.profile_id` → Use `tm.user_id`

## Query Templates

### Basic Events Query
```sql
SELECT 
  c.id as cluster_id,
  c.cluster_name,
  c.description,
  c.start_date,
  c.end_date,
  c.cluster_type,
  c.slug_cluster,
  c.is_active,
  c.shadowban,
  p.name as profile_name,
  li.nit as legal_info_nit
FROM clusters c
JOIN profile p ON c.profile_id = p.id
LEFT JOIN legal_info li ON c.legal_info_id = li.id
WHERE c.is_active = true 
  AND c.shadowban = false
ORDER BY c.start_date DESC;
```

### Events with Areas and Images
```sql
SELECT 
  c.*,
  p.name as profile_name,
  li.nit as legal_info_nit,
  -- Areas as JSON
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'area_id', a.id,
        'area_name', a.area_name,
        'description', a.description
      )
    ) FILTER (WHERE a.id IS NOT NULL),
    '[]'::json
  ) as areas_data,
  -- Images as JSON  
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'image_id', ci.id,
        'image_url', ci.image_url,
        'alt_text', ci.alt_text,
        'is_primary', ci.is_primary
      )
    ) FILTER (WHERE ci.id IS NOT NULL),
    '[]'::json
  ) as images_data
FROM clusters c
JOIN profile p ON c.profile_id = p.id
LEFT JOIN legal_info li ON c.legal_info_id = li.id
LEFT JOIN areas a ON c.id = a.cluster_id
LEFT JOIN cluster_images ci ON c.id = ci.cluster_id
GROUP BY c.id, p.id, p.name, li.id, li.nit
ORDER BY c.start_date DESC;
```

### Tenant-Isolated Events Query
```sql
-- Add tenant isolation to any query:
WHERE p.id IN (
  SELECT tm.user_id 
  FROM tenant_members tm 
  WHERE tm.tenant_id = $tenant_id AND tm.is_active = true
)
```

## Last Updated
Generated on: $(date)
Based on: Database structure analysis and error resolution