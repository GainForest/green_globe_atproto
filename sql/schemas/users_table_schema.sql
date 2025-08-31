-- Users Table Schema Definition
-- Dataset: ecocertain.green_globe_v2_development
-- Table: users

/*
Table Purpose:
Stores user account information and profiles for the platform.
Users can be associated with specific projects or be platform-wide users.

Business Rules:
- Users can exist independently or be linked to projects
- Multiple roles supported (admin, researcher, volunteer, etc.)
- Profile information is optional but encouraged
- Users can have multiple wallet addresses for different blockchains
*/

-- Schema Definition
CREATE TABLE IF NOT EXISTS `ecocertain.green_globe_v2_development.users` (
  -- Primary Key
  id STRING NOT NULL,  -- Unique user identifier (could be UUID or DID)

  -- Authentication & Basic Info
  email STRING,        -- User email address (nullable for privacy)
  first_name STRING,   -- User's first name
  last_name STRING,    -- User's last name
  username STRING,     -- Unique username/handle

  -- Profile Information
  profile_picture_url STRING,  -- URL to profile picture
  bio STRING,         -- User biography/description
  location STRING,    -- User's location (city, country)

  -- Relationships
  project_id STRING,  -- Optional: Associated project ID

  -- Permissions & Roles
  role STRING,        -- User role: 'admin', 'researcher', 'volunteer', 'observer'
  is_active BOOLEAN DEFAULT TRUE,  -- Account status

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)

-- BigQuery Optimizations
PARTITION BY DATE(created_at)
CLUSTER BY project_id, role;

-- Constraints (logical, not enforced in BigQuery)
-- UNIQUE(username) - usernames should be unique
-- CHECK(role IN ('admin', 'researcher', 'volunteer', 'observer'))

-- Expected Data Volume: Medium (thousands to tens of thousands)
-- Update Frequency: Low (profile updates)
-- Query Patterns: Filtered by project_id, role, location
