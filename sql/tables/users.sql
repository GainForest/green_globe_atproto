-- Users Table
-- This table stores user account information

CREATE TABLE IF NOT EXISTS `ecocertain.green_globe_v2_development.users` (
  id STRING NOT NULL,
  email STRING,
  first_name STRING,
  last_name STRING,
  username STRING,
  profile_picture_url STRING,
  bio STRING,
  location STRING,
  project_id STRING, -- Optional: link to project if user is project-specific
  role STRING, -- e.g., 'admin', 'researcher', 'volunteer'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY project_id, role;

-- Add any constraints or indexes here
-- ALTER TABLE `ecocertain.green_globe_v2_development.users` ADD PRIMARY KEY (id) NOT ENFORCED;
