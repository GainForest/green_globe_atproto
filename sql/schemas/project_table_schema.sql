-- Project Table Schema Definition
-- Dataset: ecocertain.green_globe_v2_development
-- Table: project

/*
Table Purpose:
Stores core information about conservation and environmental projects.
This is the main entity table that other tables reference.

Business Rules:
- Each project has a unique ID
- Projects can span multiple countries
- Projects have defined start and end dates
- Geographic coordinates (lat/lon) are stored as strings for flexibility
*/

-- Schema Definition
CREATE TABLE IF NOT EXISTS `ecocertain.green_globe_v2_development.project` (
  -- Primary Key
  id STRING NOT NULL,  -- Unique project identifier

  -- Core Project Information
  country STRING,      -- Country where project is located
  description STRING,  -- Short project description (max 500 chars recommended)
  longDescription STRING, -- Detailed project description (unlimited)

  -- Project Timeline
  startDate DATE,      -- Project start date
  endDate DATE,        -- Project end date

  -- Project Details
  objective STRING,    -- Main project objective/goal

  -- Geographic Information
  lat STRING,          -- Latitude coordinate
  lon STRING,          -- Longitude coordinate

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)

-- BigQuery Optimizations
PARTITION BY DATE(created_at)
CLUSTER BY country, startDate;

-- Indexes (BigQuery automatically handles clustering)
-- Primary Key Constraint (logical, not enforced in BigQuery)
-- ALTER TABLE `ecocertain.green_globe_v2_development.project` ADD PRIMARY KEY (id) NOT ENFORCED;

-- Expected Data Volume: Medium (hundreds to thousands of projects)
-- Update Frequency: Low to Medium (project details change occasionally)
-- Query Patterns: Filtered by country, date ranges, geographic bounds
