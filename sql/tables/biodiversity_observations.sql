-- Biodiversity Observations Table
-- This table stores biodiversity observation data

CREATE TABLE IF NOT EXISTS `ecocertain.green_globe_v2_development.biodiversity_observations` (
  id STRING NOT NULL,
  project_id STRING NOT NULL,
  observer_id STRING, -- Reference to users.id
  species_name STRING,
  species_category STRING, -- e.g., 'plant', 'animal', 'insect', 'bird', 'reptile', 'amphibian', 'mammal'
  observation_date DATE,
  latitude FLOAT64,
  longitude FLOAT64,
  count INTEGER,
  confidence_level STRING, -- e.g., 'high', 'medium', 'low'
  notes STRING,
  image_urls ARRAY<STRING>, -- Array of image URLs
  weather_conditions STRING,
  habitat_type STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY observation_date
CLUSTER BY project_id, species_category;

-- Add foreign key relationships (if needed)
-- Note: BigQuery doesn't enforce foreign keys but we can reference them in queries
