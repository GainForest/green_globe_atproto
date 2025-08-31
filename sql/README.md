# SQL Database Schema

This directory contains SQL files for managing the Green Globe project's BigQuery database schema.

## Directory Structure

```
sql/
├── README.md                 # This file - documentation and usage guide
├── schemas/                  # Dataset and schema-level definitions
│   ├── dataset_schema.sql    # Overall dataset structure documentation
│   ├── project_table_schema.sql         # Detailed project table schema
│   ├── users_table_schema.sql           # Detailed users table schema
│   ├── biodiversity_observations_schema.sql  # Biodiversity observations schema
│   ├── tree_measurements_schema.sql     # Tree measurements schema
│   └── relationships_and_constraints.sql     # Database relationships & constraints
├── tables/                   # Table creation scripts
│   ├── project.sql          # Project information table
│   ├── users.sql            # User accounts table
│   ├── biodiversity_observations.sql  # Species observation data
│   └── tree_measurements.sql          # Tree measurement data
├── migrations/               # Database migration scripts
│   └── 001_initial_tables.sql         # Initial table setup
├── functions/                # User-defined functions (UDFs)
├── views/                    # Database views
│   └── project_summary.sql   # Comprehensive project overview
└── seeds/                    # Sample data for development/testing
```

## Schema Files

The `schemas/` directory contains detailed documentation for each table:

- **`dataset_schema.sql`** - Overview of the entire dataset architecture
- **`*_table_schema.sql`** - Individual table schemas with detailed field descriptions
- **`relationships_and_constraints.sql`** - Entity relationships and business rules

Each schema file includes:
- Table purpose and business rules
- Detailed field descriptions
- BigQuery optimization settings (partitioning, clustering)
- Expected data volumes and query patterns
- Logical constraints (for documentation purposes)

## BigQuery Dataset Information

- **Project ID**: `ecocertain`
- **Dataset**: `green_globe_v2_development`
- **Location**: US (default)

## Usage

### Creating Tables

1. Navigate to the `tables/` directory
2. Execute table creation scripts in BigQuery console or via API
3. Example:
   ```sql
   -- Execute the project table creation
   -- Copy contents of sql/tables/project.sql and run in BigQuery
   ```

### Running Migrations

1. Check the `migrations/` directory for ordered migration files
2. Execute migrations in numerical order
3. Document any changes in the migration files

### Creating Views

1. Views in the `views/` directory can be created after base tables exist
2. Execute view creation scripts to create materialized views for complex queries

## Best Practices

### Table Design
- Use `PARTITION BY` for time-based tables (e.g., by date)
- Use `CLUSTER BY` for frequently filtered columns
- Include `created_at` and `updated_at` timestamps
- Use appropriate data types (STRING, INTEGER, FLOAT64, DATE, TIMESTAMP, etc.)

### Naming Conventions
- Table names: snake_case (e.g., `biodiversity_observations`)
- Column names: snake_case (e.g., `project_id`, `created_at`)
- Use descriptive names that indicate data type when helpful (e.g., `latitude_degrees`)

### Security
- Use appropriate permissions for BigQuery datasets
- Consider row-level security for sensitive data
- Document any access patterns in comments

## Adding New Tables

1. Create a new `.sql` file in the `tables/` directory
2. Follow the established naming and structure patterns
3. Add documentation comments explaining the table's purpose
4. Create a new migration file if this is a schema change
5. Update this README if adding new categories

## Example Table Creation

```sql
-- Example of a new table
CREATE TABLE IF NOT EXISTS `ecocertain.green_globe_v2_development.new_table` (
  id STRING NOT NULL,
  name STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at);
```

## Contact

For questions about database schema or to propose changes, please refer to the project documentation or contact the development team.
