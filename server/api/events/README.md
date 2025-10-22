# Events API Documentation

This directory contains the API endpoints for managing events (clusters) in the system.

## Overview

The Events API provides functionality for creating, retrieving, and managing events with their associated areas, units, and legal information. The system uses a **stored procedure approach** for robust transaction handling.

## Architecture

### Database Structure
```
TENANTS → TENANT_MEMBERS → PROFILE → CLUSTERS (Events)
                                        ├── LEGAL_INFO
                                        ├── AREAS → UNITS
                                        └── CLUSTER_IMAGES → IMAGES
```

### Core Tables Involved
- **clusters** - Main event data
- **legal_info** - Legal information for events  
- **areas** - Event areas/zones
- **units** - Individual units within areas (generated automatically)
- **cluster_images** - Images associated with events
- **tenant_sites** - Tenant isolation
- **tenant_members** - User-tenant relationships

## Endpoints

### GET `/api/events/`
Retrieves paginated list of events for the authenticated user.

**Query Parameters:**
- `limit` (optional, default: 20): Number of events to retrieve
- `offset` (optional, default: 0): Number of events to skip for pagination

**Response Structure:**
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "events": [
    {
      "id": 25,
      "name": "Event Name",
      "description": "Event description",
      "type": "event_type",
      "slug": "event-name",
      "startDate": "2024-12-20T19:00:00.000Z",
      "endDate": "2024-12-20T23:00:00.000Z",
      "profileId": "profile-uuid",
      "profileName": "Profile Name",
      "legalInfoId": 4,
      "legalInfoNit": "123456789",
      "areas": [
        {
          "area_id": 56,
          "area_name": "VIP Premium",
          "description": "VIP area description"
        }
      ],
      "images": [
        {
          "image_id": "image-uuid",
          "image_url": "image.jpg",
          "alt_text": "Image description",
          "name": "image_name",
          "mime_type": "image/jpeg"
        }
      ],
      "isActive": true,
      "shadowban": false,
      "createdAt": "2025-09-30T04:04:43.199Z",
      "updatedAt": "2025-09-30T04:04:43.199Z"
    }
  ],
  "totalCount": 2,
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": false
  },
  "filters": {
    "name": null,
    "type": null,
    "startDateAfter": null,
    "endDateBefore": null,
    "profileId": null
  }
}
```

### POST `/api/events/`
Creates a new event with all associated data using a stored procedure for transaction safety.

**Request Body:**
```json
{
  "profile_id": "uuid",
  "event_data": {
    "cluster_name": "Event Name",
    "description": "Event description",
    "start_date": "2024-12-20T19:00:00",
    "end_date": "2024-12-20T23:00:00",
    "cluster_type": "event_type",
    "slug_cluster": "optional-custom-slug"
  },
  "areas_data": [
    {
      "area_name": "VIP Premium",
      "description": "VIP area description",
      "capacity": 50,
      "price": 150.00,
      "unit_capacity": 5,
      "nomenclature_letter": "A",
      "currency": "USD",
      "status": "available",
      "service": 0,
      "extra_attributes": {}
    }
  ],
  "legal_info_data": {
    "nit": "123456789",
    "company_name": "Company Name",
    "address": "Company Address",
    "city": "City",
    "country": "Country"
  },
  "images_data": [
    {
      "image_id": "uuid"
    }
  ]
}
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event": {
      "id": 25,
      "name": "Event Name",
      "description": "Event description",
      "type": "event_type",
      "slug": "event-name",
      "startDate": "2024-12-20T19:00:00",
      "endDate": "2024-12-20T23:00:00",
      "profileId": "profile-uuid",
      "legalInfoId": 4,
      "isActive": true,
      "shadowban": false,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    },
    "areas": [
      {
        "id": 56,
        "area_name": "VIP Premium",
        "description": "VIP area description",
        "unit_capacity": 5,
        "nomenclature_letter": "A",
        "units_created": 5,
        "units": [
          {
            "id": 35201,
            "nomenclature": "A1",
            "status": "available"
          }
        ]
      }
    ],
    "images": [],
    "tenant": {
      "id": "tenant-uuid",
      "name": "Tenant Name",
      "site": "site.com"
    }
  }
}
```

## Stored Procedure Implementation

The POST endpoint uses the `create_complete_event` stored procedure located at:
`/database/stored-procedures/create_complete_event.sql`

### Automatic Features

#### Tenant Detection
The API automatically detects the tenant based on request headers:
- `host`, `origin`, `referer` headers
- Development mode uses `dev-site-mapping.json` for port mapping
- Production mode uses direct header analysis

#### Unit Generation
When creating areas, units are automatically generated:
- Units follow nomenclature: `{nomenclature_letter}{unit_number}` (e.g., A1, A2, B1, B2)
- Number of units matches `unit_capacity` field
- All units start with `status: "available"`

#### Slug Generation
Event slugs are automatically generated from `cluster_name`:
- Converts to lowercase
- Replaces non-alphanumeric with hyphens
- Removes leading/trailing hyphens

## Transaction Safety

The POST endpoint uses a stored procedure that ensures:
- **Atomicity**: All operations succeed or none do
- **Data integrity**: All required fields validated before execution
- **Consistent state**: No partial data creation on failures

### What Gets Created in One Transaction:
1. **legal_info** record (required)
2. **clusters** record (main event)
3. **areas** records (one per area in areas_data)
4. **units** records (automatic generation based on unit_capacity)
5. **cluster_images** records (if images provided)

## Security

### Authentication
- Events endpoints are exempt from token requirements for creation
- Tenant isolation enforced through automatic detection
- Profile ownership verified against tenant membership

### Validation
- All required fields validated by stored procedure
- UUID format validation
- Date range validation (start < end)
- Capacity limits enforced (1-1000 units per area)
- Nomenclature format validation (A-Z letters only)

## Error Handling

### Common Error Responses
- `400 Bad Request`: Invalid input data or validation failures
- `404 Not Found`: Tenant not found for detected site
- `403 Forbidden`: Profile doesn't belong to detected tenant
- `500 Internal Server Error`: Database or system errors

### Stored Procedure Errors
The stored procedure provides detailed error messages for:
- Missing required fields
- Invalid data types
- Constraint violations
- Business rule violations

## File Structure
```
/server/api/events/
├── README.md              # This documentation
├── index.get.js          # GET endpoint for listing events
└── index.post.js         # POST endpoint for creating events (uses stored procedure)
```

## Related Files
- `/database/stored-procedures/create_complete_event.sql` - Main stored procedure
- `/server/api/stored-procedures/` - Stored procedure management endpoints
- `/server/middleware/tenantSecurity.js` - Security middleware (events are exempt)

## Usage Examples

### Creating a Simple Event
```bash
curl -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -H "Host: localhost:8080" \
  -d '{
    "profile_id": "profile-uuid",
    "event_data": {
      "cluster_name": "My Event",
      "description": "Event description",
      "start_date": "2024-12-25T10:00:00",
      "end_date": "2024-12-25T18:00:00",
      "cluster_type": "concert"
    },
    "areas_data": [{
      "area_name": "General",
      "description": "General admission",
      "capacity": 100,
      "price": 50.00,
      "unit_capacity": 10,
      "nomenclature_letter": "A"
    }],
    "legal_info_data": {
      "nit": "123456789",
      "company_name": "My Company",
      "address": "123 Street",
      "city": "City",
      "country": "Country"
    }
  }'
```

### Retrieving Events
```bash
curl -X GET "http://localhost:4000/api/events?limit=10&offset=0" \
  -H "Host: localhost:8080"
```

## Migration Notes

This API was migrated from individual database operations to a stored procedure approach for:
- Better transaction handling
- Improved performance
- Reduced complexity
- Enhanced data integrity

The stored procedure approach ensures that event creation is atomic - either all related data (event, legal info, areas, units) is created successfully, or nothing is created at all.

## Testing

The system has been tested with:
- Event creation with multiple areas
- Unit generation with different capacities
- Tenant detection across different sites
- Error handling for invalid data
- Transaction rollback on failures

Last successful test created:
- Event ID: 25 "Concierto de Jazz Test SP"
- 2 areas (VIP Premium: 5 units, General: 20 units)
- 25 total units with correct nomenclature (A1-A5, B1-B20)
- Full tenant isolation with "Waro Colombia"