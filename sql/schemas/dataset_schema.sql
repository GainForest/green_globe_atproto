-- BigQuery Dataset Schema
-- Dataset: ecocertain.green_globe_v2_development
-- Location: US
-- Project: ecocertain

/*
OVERVIEW:
This dataset contains all data for the Green Globe conservation platform.
It includes project management, user data, biodiversity observations,
and environmental measurements.

ARCHITECTURE:
- Uses BigQuery for scalable analytics and data warehousing
- Tables are partitioned by date where appropriate
- Clustering is used for frequently queried columns
- Relationships are maintained through foreign key references

TABLE ORGANIZATION:
├── Core Tables:
│   ├── project - Conservation project information
│   └── users - User accounts and profiles
├── Data Collection Tables:
│   ├── biodiversity_observations - Species observation data
│   └── tree_measurements - Forest inventory measurements
└── Supporting Tables:
    └── (future: donations, media, analytics, etc.)
*/

-- Current Tables:
-- 1. project - Core project entities (parent table)
-- 2. users - User accounts (parent table)
-- 3. biodiversity_observations - Species observations (child of project, users)
-- 4. tree_measurements - Tree measurements (child of project, users)

-- Views:
-- 1. project_summary - Aggregated project statistics

-- See individual schema files for detailed table definitions:
-- - schemas/project_table_schema.sql
-- - schemas/users_table_schema.sql
-- - schemas/biodiversity_observations_schema.sql
-- - schemas/tree_measurements_schema.sql
-- - schemas/relationships_and_constraints.sql

/*
DATA FLOW:
1. Projects are created first
2. Users are created and optionally linked to projects
3. Biodiversity observations reference projects and users
4. Tree measurements reference projects and users

RETENTION POLICY:
- No automatic data deletion
- Historical data preserved for trend analysis
- Consider archiving old data if storage becomes an issue

BACKUP STRATEGY:
- BigQuery automatic backups
- Cross-region replication recommended
- Export critical data periodically
*/
