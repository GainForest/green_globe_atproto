-- Migration 001: Initial Tables Setup
-- Created: YYYY-MM-DD
-- Description: Create initial core tables for Green Globe project

-- This migration creates the foundational tables for the application
-- Run order: Execute all table creation statements in sequence

-- Note: BigQuery doesn't have traditional migrations like PostgreSQL
-- Instead, we use CREATE TABLE IF NOT EXISTS for safety
-- Track changes manually in this file

/*
Tables created in this migration:
1. project - Core project information
2. users - User accounts and profiles
3. biodiversity_observations - Species observation data
4. tree_measurements - Tree measurement data

Usage:
1. Copy and execute each table creation statement individually
2. Or execute this entire file
3. Verify table creation in BigQuery console
*/

-- Include table creation statements here (they're in separate files)
-- Reference: ../tables/project.sql
-- Reference: ../tables/users.sql
-- Reference: ../tables/biodiversity_observations.sql
-- Reference: ../tables/tree_measurements.sql
