/**
 * Role-based field schemas for profile management
 * Defines the structure and validation rules for each role type
 */

// Field type definitions
export const FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number', 
  BOOLEAN: 'boolean',
  JSON: 'json',
  EMAIL: 'email',
  URL: 'url',
  PHONE: 'phone',
  DATE: 'date',
  TIME: 'time'
};

// Role-specific field schemas
const ROLE_SCHEMAS = {
  photographer: [
    { 
      name: 'portfolio_url', 
      type: FIELD_TYPES.URL, 
      required: false, 
      label: 'Portfolio URL',
      description: 'Link to your photography portfolio or website',
      placeholder: 'https://your-portfolio.com'
    },
    { 
      name: 'specialties', 
      type: FIELD_TYPES.JSON, 
      required: false, 
      label: 'Photography Specialties',
      description: 'Types of photography you specialize in',
      placeholder: '["weddings", "events", "portraits", "commercial"]'
    },
    { 
      name: 'equipment', 
      type: FIELD_TYPES.JSON, 
      required: false, 
      label: 'Camera Equipment',
      description: 'Professional equipment you own',
      placeholder: '["Canon 5D Mark IV", "24-70mm f/2.8", "85mm f/1.4"]'
    },
    { 
      name: 'hourly_rate', 
      type: FIELD_TYPES.NUMBER, 
      required: false, 
      label: 'Hourly Rate (USD)',
      description: 'Your professional hourly rate',
      min: 0,
      placeholder: '150'
    },
    { 
      name: 'availability', 
      type: FIELD_TYPES.JSON, 
      required: false, 
      label: 'Availability Schedule',
      description: 'Your typical availability',
      placeholder: '{"weekdays": "9AM-6PM", "weekends": "10AM-8PM"}'
    },
    { 
      name: 'instagram', 
      type: FIELD_TYPES.TEXT, 
      required: false, 
      label: 'Instagram Handle',
      description: 'Your Instagram username (without @)',
      placeholder: 'your_photography_handle'
    },
    { 
      name: 'experience_years', 
      type: FIELD_TYPES.NUMBER, 
      required: false, 
      label: 'Years of Experience',
      description: 'How many years you have been a professional photographer',
      min: 0,
      max: 50
    }
  ],

  dj: [
    { 
      name: 'stage_name', 
      type: FIELD_TYPES.TEXT, 
      required: false, 
      label: 'Stage Name',
      description: 'Your DJ stage name or artist name',
      placeholder: 'DJ YourName'
    },
    { 
      name: 'music_genres', 
      type: FIELD_TYPES.JSON, 
      required: false, 
      label: 'Music Genres',
      description: 'Musical genres you specialize in',
      placeholder: '["Electronic", "House", "Techno", "Reggaeton"]'
    },
    { 
      name: 'equipment_owned', 
      type: FIELD_TYPES.BOOLEAN, 
      required: false, 
      label: 'Owns DJ Equipment',
      description: 'Do you have your own professional DJ equipment?'
    },
    { 
      name: 'hourly_rate', 
      type: FIELD_TYPES.NUMBER, 
      required: false, 
      label: 'Hourly Rate (USD)',
      description: 'Your rate per hour for events',
      min: 0,
      placeholder: '200'
    },
    { 
      name: 'soundcloud', 
      type: FIELD_TYPES.URL, 
      required: false, 
      label: 'SoundCloud Profile',
      description: 'Link to your SoundCloud profile',
      placeholder: 'https://soundcloud.com/yourdj'
    },
    { 
      name: 'spotify', 
      type: FIELD_TYPES.URL, 
      required: false, 
      label: 'Spotify Profile',
      description: 'Link to your Spotify artist profile',
      placeholder: 'https://open.spotify.com/artist/...'
    },
    { 
      name: 'youtube', 
      type: FIELD_TYPES.URL, 
      required: false, 
      label: 'YouTube Channel',
      description: 'Link to your YouTube channel',
      placeholder: 'https://youtube.com/@yourchannel'
    },
    { 
      name: 'mixing_style', 
      type: FIELD_TYPES.TEXT, 
      required: false, 
      label: 'Mixing Style',
      description: 'Describe your unique mixing style',
      placeholder: 'Progressive house with Latin influences'
    }
  ],

  bar: [
    { 
      name: 'business_name', 
      type: FIELD_TYPES.TEXT, 
      required: true, 
      label: 'Business Name',
      description: 'Official name of your bar or establishment',
      placeholder: 'The Golden Tap'
    },
    { 
      name: 'address', 
      type: FIELD_TYPES.TEXT, 
      required: true, 
      label: 'Full Address',
      description: 'Complete address including city and postal code',
      placeholder: 'Calle 123 #45-67, Bogotá, Colombia'
    },
    { 
      name: 'phone', 
      type: FIELD_TYPES.PHONE, 
      required: false, 
      label: 'Business Phone',
      description: 'Contact phone number for reservations',
      placeholder: '+57 301 234 5678'
    },
    { 
      name: 'opening_hours', 
      type: FIELD_TYPES.JSON, 
      required: false, 
      label: 'Opening Hours',
      description: 'Business hours for each day of the week',
      placeholder: '{"monday": "5PM-12AM", "tuesday": "5PM-12AM", "friday": "5PM-2AM"}'
    },
    { 
      name: 'capacity', 
      type: FIELD_TYPES.NUMBER, 
      required: false, 
      label: 'Maximum Capacity',
      description: 'Maximum number of people your venue can accommodate',
      min: 1,
      placeholder: '150'
    },
    { 
      name: 'bar_type', 
      type: FIELD_TYPES.TEXT, 
      required: false, 
      label: 'Bar Type',
      description: 'Type of bar (Sports Bar, Cocktail Lounge, etc.)',
      placeholder: 'Cocktail Lounge'
    },
    { 
      name: 'amenities', 
      type: FIELD_TYPES.JSON, 
      required: false, 
      label: 'Available Amenities',
      description: 'Services and features available at your venue',
      placeholder: '["Live Music", "Pool Tables", "Outdoor Seating", "VIP Area"]'
    },
    { 
      name: 'website', 
      type: FIELD_TYPES.URL, 
      required: false, 
      label: 'Website URL',
      description: 'Your business website or social media page',
      placeholder: 'https://thegoldentap.com'
    },
    { 
      name: 'cuisine_type', 
      type: FIELD_TYPES.TEXT, 
      required: false, 
      label: 'Cuisine Type',
      description: 'Type of food served (if applicable)',
      placeholder: 'Colombian, International'
    }
  ],

  admin: [
    { 
      name: 'department', 
      type: FIELD_TYPES.TEXT, 
      required: false, 
      label: 'Department',
      description: 'Administrative department or area of responsibility',
      placeholder: 'Content Management'
    },
    { 
      name: 'permissions', 
      type: FIELD_TYPES.JSON, 
      required: false, 
      label: 'Admin Permissions',
      description: 'Specific administrative permissions granted',
      placeholder: '["user_management", "content_moderation", "analytics"]'
    },
    { 
      name: 'last_login', 
      type: FIELD_TYPES.DATE, 
      required: false, 
      label: 'Last Login',
      description: 'Date of last administrative login',
      readonly: true
    },
    { 
      name: 'access_level', 
      type: FIELD_TYPES.NUMBER, 
      required: false, 
      label: 'Access Level',
      description: 'Administrative access level (1-10)',
      min: 1,
      max: 10,
      placeholder: '5'
    }
  ]
};

/**
 * Get field schema for a specific role
 * @param {string} role - The role name
 * @returns {Array} Array of field definitions
 */
export function getRoleFields(role) {
  return ROLE_SCHEMAS[role] || [];
}

/**
 * Get all available roles
 * @returns {Array} Array of role names
 */
export function getAvailableRoles() {
  return Object.keys(ROLE_SCHEMAS);
}

/**
 * Validate field value against its schema
 * @param {string} role - The role name
 * @param {string} fieldName - Name of the field
 * @param {any} value - Value to validate
 * @returns {Object} Validation result
 */
export function validateField(role, fieldName, value) {
  const roleFields = getRoleFields(role);
  const fieldSchema = roleFields.find(field => field.name === fieldName);
  
  if (!fieldSchema) {
    return {
      valid: false,
      error: `Field '${fieldName}' is not defined for role '${role}'`
    };
  }

  // Check required fields
  if (fieldSchema.required && (value === null || value === undefined || value === '')) {
    return {
      valid: false,
      error: `Field '${fieldName}' is required`
    };
  }

  // Type validation
  if (value !== null && value !== undefined && value !== '') {
    const typeValidation = validateFieldType(fieldSchema.type, value);
    if (!typeValidation.valid) {
      return typeValidation;
    }

    // Range validation for numbers
    if (fieldSchema.type === FIELD_TYPES.NUMBER) {
      if (fieldSchema.min !== undefined && value < fieldSchema.min) {
        return {
          valid: false,
          error: `Value must be at least ${fieldSchema.min}`
        };
      }
      if (fieldSchema.max !== undefined && value > fieldSchema.max) {
        return {
          valid: false,
          error: `Value must be at most ${fieldSchema.max}`
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Validate value type
 * @param {string} type - Expected type
 * @param {any} value - Value to validate
 * @returns {Object} Validation result
 */
function validateFieldType(type, value) {
  switch (type) {
    case FIELD_TYPES.TEXT:
      if (typeof value !== 'string') {
        return { valid: false, error: 'Value must be a string' };
      }
      break;
    
    case FIELD_TYPES.NUMBER:
      if (typeof value !== 'number' || isNaN(value)) {
        return { valid: false, error: 'Value must be a valid number' };
      }
      break;
    
    case FIELD_TYPES.BOOLEAN:
      if (typeof value !== 'boolean') {
        return { valid: false, error: 'Value must be true or false' };
      }
      break;
    
    case FIELD_TYPES.JSON:
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch (error) {
          return { valid: false, error: 'Value must be valid JSON' };
        }
      }
      break;
    
    case FIELD_TYPES.EMAIL:
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Value must be a valid email address' };
      }
      break;
    
    case FIELD_TYPES.URL:
      try {
        new URL(value);
      } catch (error) {
        return { valid: false, error: 'Value must be a valid URL' };
      }
      break;
  }

  return { valid: true };
}

/**
 * Validate all fields for a role
 * @param {string} role - The role name
 * @param {Object} data - Object with field values
 * @returns {Object} Validation result with errors
 */
export function validateRoleData(role, data) {
  const roleFields = getRoleFields(role);
  const errors = {};
  let isValid = true;

  for (const field of roleFields) {
    const value = data[field.name];
    const validation = validateField(role, field.name, value);
    
    if (!validation.valid) {
      errors[field.name] = validation.error;
      isValid = false;
    }
  }

  return {
    valid: isValid,
    errors: errors
  };
}