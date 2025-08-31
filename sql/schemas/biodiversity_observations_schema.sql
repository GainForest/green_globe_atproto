-- Biodiversity Observations Table Schema Definition
-- Dataset: ecocertain.green_globe_v2_development
-- Table: biodiversity_observations

/*
Table Purpose:
Stores biodiversity observation data collected during field work.
This table captures species sightings, counts, and related environmental data.

Business Rules:
- All observations must be linked to a project
- Species information is stored as both name and category
- Geographic coordinates are required for spatial analysis
- Multiple images can be associated with a single observation
- Confidence levels help assess data quality
*/

-- Schema Definition
CREATE TABLE IF NOT EXISTS `ecocertain.green_globe_v2_development.biodiversity_observations` (
  -- Primary Key
  id STRING NOT NULL,  -- Unique observation identifier

  -- Relationships
  project_id STRING NOT NULL,    -- Reference to project.id
  observer_id STRING,            -- Reference to users.id (who made observation)

  -- Species Information
  species_name STRING,           -- Scientific or common name of species
  species_category STRING,       -- Category: 'plant', 'animal', 'insect', 'bird', 'reptile', 'amphibian', 'mammal'

  -- Observation Details
  observation_date DATE,         -- Date of observation
  latitude FLOAT64,              -- Latitude coordinate (decimal degrees)
  longitude FLOAT64,             -- Longitude coordinate (decimal degrees)
  count INTEGER,                 -- Number of individuals observed

  -- Data Quality
  confidence_level STRING,       -- 'high', 'medium', 'low'

  -- Additional Information
  notes STRING,                  -- Additional observation notes
  image_urls ARRAY<STRING>,      -- Array of image URLs
  weather_conditions STRING,     -- Weather during observation
  habitat_type STRING,           -- Habitat type (forest, grassland, wetland, etc.)

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)

-- BigQuery Optimizations
PARTITION BY observation_date
CLUSTER BY project_id, species_category;

-- Constraints (logical, not enforced in BigQuery)
-- FOREIGN KEY (project_id) REFERENCES project(id)
-- FOREIGN KEY (observer_id) REFERENCES users(id)
-- CHECK(species_category IN ('plant', 'animal', 'insect', 'bird', 'reptile', 'amphibian', 'mammal'))
-- CHECK(confidence_level IN ('high', 'medium', 'low'))

-- Expected Data Volume: High (potentially millions of observations)
-- Update Frequency: High (new observations added regularly)
-- Query Patterns: Filtered by project_id, species, date ranges, geographic areas
