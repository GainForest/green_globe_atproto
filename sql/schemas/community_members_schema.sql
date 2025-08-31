-- Community Members Schema
-- This schema defines the structure for community members associated with projects

CREATE TABLE IF NOT EXISTS `ecocertain.green_globe_v2_development.community_members` (
  id STRING NOT NULL,
  wallet_address_id INT64,
  project_id INT64 NOT NULL,
  first_name STRING NOT NULL,
  last_name STRING NOT NULL,
  title STRING NOT NULL,
  bio STRING,
  profile_image_url STRING,
  display_order INT64,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY project_id, is_active;

-- Add any constraints or indexes here
-- ALTER TABLE `ecocertain.green_globe_v2_development.community_members` ADD PRIMARY KEY (id) NOT ENFORCED;

-- Foreign key relationship with project table
-- ALTER TABLE `ecocertain.green_globe_v2_development.community_members`
-- ADD CONSTRAINT fk_community_members_project
-- FOREIGN KEY (project_id) REFERENCES `ecocertain.green_globe_v2_development.project`(id) NOT ENFORCED;
