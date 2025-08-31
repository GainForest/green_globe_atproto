-- Database Relationships and Constraints
-- Dataset: ecocertain.green_globe_v2_development

/*
ENTITY RELATIONSHIP DIAGRAM OVERVIEW:

project (1) ──── (many) biodiversity_observations
  │                      │
  │                      └── observer_id ──── users (many)
  │
  └── (many) users (via project_id)
  │
  └── (many) tree_measurements
         │
         └── measured_by ──── users (many)

TABLE RELATIONSHIPS:
1. project (parent)
   - Referenced by: biodiversity_observations.project_id
   - Referenced by: users.project_id
   - Referenced by: tree_measurements.project_id

2. users (parent)
   - Referenced by: biodiversity_observations.observer_id
   - Referenced by: tree_measurements.measured_by

3. biodiversity_observations (child)
   - References: project.project_id
   - References: users.observer_id

4. tree_measurements (child)
   - References: project.project_id
   - References: users.measured_by
*/

-- LOGICAL CONSTRAINTS (Not enforced in BigQuery)
-- These constraints should be validated in application code

-- Project Constraints
/*
ALTER TABLE `ecocertain.green_globe_v2_development.project`
ADD CONSTRAINT pk_project PRIMARY KEY (id);

ALTER TABLE `ecocertain.green_globe_v2_development.project`
ADD CONSTRAINT chk_project_dates
CHECK (startDate <= endDate OR endDate IS NULL);
*/

-- Users Constraints
/*
ALTER TABLE `ecocertain.green_globe_v2_development.users`
ADD CONSTRAINT pk_users PRIMARY KEY (id);

ALTER TABLE `ecocertain.green_globe_v2_development.users`
ADD CONSTRAINT uk_users_username UNIQUE (username);

ALTER TABLE `ecocertain.green_globe_v2_development.users`
ADD CONSTRAINT chk_users_role
CHECK (role IN ('admin', 'researcher', 'volunteer', 'observer'));

ALTER TABLE `ecocertain.green_globe_v2_development.users`
ADD CONSTRAINT fk_users_project
FOREIGN KEY (project_id) REFERENCES project(id);
*/

-- Biodiversity Observations Constraints
/*
ALTER TABLE `ecocertain.green_globe_v2_development.biodiversity_observations`
ADD CONSTRAINT pk_biodiversity_observations PRIMARY KEY (id);

ALTER TABLE `ecocertain.green_globe_v2_development.biodiversity_observations`
ADD CONSTRAINT fk_bio_obs_project
FOREIGN KEY (project_id) REFERENCES project(id);

ALTER TABLE `ecocertain.green_globe_v2_development.biodiversity_observations`
ADD CONSTRAINT fk_bio_obs_observer
FOREIGN KEY (observer_id) REFERENCES users(id);

ALTER TABLE `ecocertain.green_globe_v2_development.biodiversity_observations`
ADD CONSTRAINT chk_bio_obs_category
CHECK (species_category IN ('plant', 'animal', 'insect', 'bird', 'reptile', 'amphibian', 'mammal'));

ALTER TABLE `ecocertain.green_globe_v2_development.biodiversity_observations`
ADD CONSTRAINT chk_bio_obs_confidence
CHECK (confidence_level IN ('high', 'medium', 'low'));

ALTER TABLE `ecocertain.green_globe_v2_development.biodiversity_observations`
ADD CONSTRAINT chk_bio_obs_count
CHECK (count > 0);
*/

-- Tree Measurements Constraints
/*
ALTER TABLE `ecocertain.green_globe_v2_development.tree_measurements`
ADD CONSTRAINT pk_tree_measurements PRIMARY KEY (id);

ALTER TABLE `ecocertain.green_globe_v2_development.tree_measurements`
ADD CONSTRAINT fk_tree_project
FOREIGN KEY (project_id) REFERENCES project(id);

ALTER TABLE `ecocertain.green_globe_v2_development.tree_measurements`
ADD CONSTRAINT fk_tree_measured_by
FOREIGN KEY (measured_by) REFERENCES users(id);

ALTER TABLE `ecocertain.green_globe_v2_development.tree_measurements`
ADD CONSTRAINT chk_tree_health
CHECK (health_status IN ('healthy', 'stressed', 'dying', 'dead', 'cut'));

ALTER TABLE `ecocertain.green_globe_v2_development.tree_measurements`
ADD CONSTRAINT chk_tree_height
CHECK (height_meters > 0 AND height_meters < 150);

ALTER TABLE `ecocertain.green_globe_v2_development.tree_measurements`
ADD CONSTRAINT chk_tree_dbh
CHECK (diameter_breast_height_cm > 0 AND diameter_breast_height_cm < 500);
*/

-- INDEX RECOMMENDATIONS (BigQuery uses clustering instead)
/*
For optimal query performance, the tables are already configured with:
- PARTITION BY: date-based partitioning where appropriate
- CLUSTER BY: frequently filtered columns

Query Optimization Tips:
1. Always include project_id in WHERE clauses when possible
2. Use date ranges for filtering large tables
3. Leverage clustering columns for better performance
4. Consider materialized views for complex aggregations
*/
