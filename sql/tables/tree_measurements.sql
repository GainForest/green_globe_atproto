-- Tree Measurements Table
-- This table stores measured tree data

CREATE TABLE IF NOT EXISTS `ecocertain.green_globe_v2_development.tree_measurements` (
  id STRING NOT NULL,
  project_id STRING NOT NULL,
  tree_species STRING,
  height_meters FLOAT64,
  diameter_breast_height_cm FLOAT64, -- DBH in centimeters
  crown_diameter_meters FLOAT64,
  health_status STRING, -- e.g., 'healthy', 'stressed', 'dead'
  latitude FLOAT64,
  longitude FLOAT64,
  measurement_date DATE,
  measured_by STRING, -- Reference to users.id
  plot_id STRING, -- Reference to measurement plot
  notes STRING,
  image_urls ARRAY<STRING>,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY measurement_date
CLUSTER BY project_id, tree_species;

-- Add any constraints or indexes here
-- This table can be joined with biodiversity_observations for comprehensive tree data
