-- Project Summary View
-- This view provides a comprehensive overview of projects with related data

CREATE OR REPLACE VIEW `ecocertain.green_globe_v2_development.project_summary` AS
SELECT
  p.id,
  p.country,
  p.description,
  p.objective,
  p.startDate,
  p.endDate,
  p.lat,
  p.lon,
  -- Count of biodiversity observations for this project
  COUNT(DISTINCT bo.id) as total_observations,
  -- Count of tree measurements for this project
  COUNT(DISTINCT tm.id) as total_tree_measurements,
  -- Count of unique users involved in this project
  COUNT(DISTINCT u.id) as total_users,
  -- Most recent activity
  GREATEST(
    MAX(bo.created_at),
    MAX(tm.created_at),
    MAX(u.created_at),
    p.created_at
  ) as last_activity
FROM `ecocertain.green_globe_v2_development.project` p
LEFT JOIN `ecocertain.green_globe_v2_development.biodiversity_observations` bo
  ON p.id = bo.project_id
LEFT JOIN `ecocertain.green_globe_v2_development.tree_measurements` tm
  ON p.id = tm.project_id
LEFT JOIN `ecocertain.green_globe_v2_development.users` u
  ON p.id = u.project_id
GROUP BY
  p.id, p.country, p.description, p.objective,
  p.startDate, p.endDate, p.lat, p.lon, p.created_at;

-- Usage:
-- SELECT * FROM `ecocertain.green_globe_v2_development.project_summary`
-- WHERE country = 'Uganda';
