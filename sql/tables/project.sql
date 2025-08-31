-- Project Table
-- This table stores information about conservation projects

CREATE TABLE IF NOT EXISTS `ecocertain.green_globe_v2_development.project` (
  id STRING NOT NULL,
  country STRING,
  description STRING,
  longDescription STRING,
  endDate DATE,
  startDate DATE,
  objective STRING,
  lat STRING,
  lon STRING,
  -- Add additional fields as needed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY country;

-- Add any constraints or indexes here
-- Example: ALTER TABLE `ecocertain.green_globe_v2_development.project` ADD PRIMARY KEY (id) NOT ENFORCED;
