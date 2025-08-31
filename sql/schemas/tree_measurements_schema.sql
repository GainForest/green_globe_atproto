-- Tree Measurements Table Schema Definition
-- Dataset: ecocertain.green_globe_v2_development
-- Table: tree_measurements

/*
Table Purpose:
Stores detailed measurements of individual trees collected during forest inventories.
This table is crucial for carbon sequestration calculations and forest health monitoring.

Business Rules:
- All measurements must be linked to a project
- Tree height and diameter measurements follow standard forestry protocols
- Geographic coordinates are required for spatial analysis
- Health status helps track forest condition over time
- Plot IDs help organize measurements into sampling units
*/

-- Schema Definition
CREATE TABLE IF NOT EXISTS `ecocertain.green_globe_v2_development.tree_measurements` (
  -- Primary Key
  id STRING NOT NULL,  -- Unique measurement identifier

  -- Relationships
  project_id STRING NOT NULL,    -- Reference to project.id
  measured_by STRING,            -- Reference to users.id (who took measurement)
  plot_id STRING,                -- Identifier for measurement plot/transect

  -- Species Information
  tree_species STRING,           -- Tree species name

  -- Physical Measurements (in metric units)
  height_meters FLOAT64,         -- Tree height in meters
  diameter_breast_height_cm FLOAT64, -- Diameter at breast height (1.3m) in cm
  crown_diameter_meters FLOAT64,     -- Crown diameter in meters

  -- Tree Health & Status
  health_status STRING,          -- 'healthy', 'stressed', 'dying', 'dead', 'cut'

  -- Geographic Information
  latitude FLOAT64,              -- Latitude coordinate (decimal degrees)
  longitude FLOAT64,             -- Longitude coordinate (decimal degrees)

  -- Temporal Information
  measurement_date DATE,         -- Date of measurement

  -- Additional Information
  notes STRING,                  -- Additional measurement notes
  image_urls ARRAY<STRING>,      -- Array of tree images

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)

-- BigQuery Optimizations
PARTITION BY measurement_date
CLUSTER BY project_id, tree_species;

-- Constraints (logical, not enforced in BigQuery)
-- FOREIGN KEY (project_id) REFERENCES project(id)
-- FOREIGN KEY (measured_by) REFERENCES users(id)
-- CHECK(health_status IN ('healthy', 'stressed', 'dying', 'dead', 'cut'))
-- CHECK(height_meters > 0 AND height_meters < 150)  -- Reasonable height range
-- CHECK(diameter_breast_height_cm > 0 AND diameter_breast_height_cm < 500)  -- Reasonable DBH range

-- Expected Data Volume: High (potentially millions of measurements)
-- Update Frequency: High (new measurements added during field campaigns)
-- Query Patterns: Filtered by project_id, species, plot_id, date ranges, health status
