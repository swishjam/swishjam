SELECT 
  e.uuid, 
  JSONExtractString(properties, 'url'), e.ingested_at AS url, 
  CAST(COUNT(DISTINCT uuid) AS INT) AS count 
FROM events AS e 
LEFT JOIN ( 
  SELECT 
    swishjam_user_id, 
    argMax(merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id 
  FROM swishjam_user_profiles 
  WHERE workspace_id = 'ed28593c-1c8c-4a8b-b3af-622a945cdc0b'
  GROUP BY swishjam_user_id 
) AS user_profiles ON user_profiles.swishjam_user_id = e.user_profile_id 
WHERE 
  e.swishjam_api_key IN ('public--swishjam_prdct-66796a6ea162ad6d', 'public--swishjam_web-e9dddc4b8cdce954', 'swishjam_stripe-0299ff5d00dd7691') AND 
  e.occurred_at BETWEEN '2023-12-26 00:00:00' AND '2024-01-25 21:49:38' AND 
  ( 
    user_profiles.swishjam_user_id = '2f8043ea-6ed8-42b1-8a52-fcfff2fe834d' OR 
    user_profiles.merged_into_swishjam_user_id = '2f8043ea-6ed8-42b1-8a52-fcfff2fe834d' 
  ) 
  AND e.name = 'page_view' 
GROUP BY e.uuid, url 
ORDER BY count DESC 
LIMIT 10



SELECT 
  e.name AS name, 
  e.occurred_at AS occurred_at, 
  e.properties AS properties 
FROM (
  SELECT 
    uuid, 
    argMax(name, ingested_at) AS name, 
    argMax(occurred_at, ingested_at) AS occurred_at, 
    argMax(properties, ingested_at) AS properties, 
    argMax(user_properties, ingested_at) AS user_properties, 
    argMax(user_profile_id, ingested_at) AS user_profile_id 
  FROM events AS e 
  WHERE 
    e.swishjam_api_key IN ('my_public_key') AND 
    e.occurred_at BETWEEN '2024-01-27 18:55:30' AND '2024-01-29 18:55:30' 
  GROUP BY e.uuid 
  LIMIT 10 
) AS e 
LEFT JOIN ( 
  SELECT 
    swishjam_user_id, 
    argMax(merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id 
  FROM swishjam_user_profiles 
  WHERE workspace_id = 'xyz' 
  GROUP BY swishjam_user_id 
) AS user_profiles ON user_profiles.swishjam_user_id = e.user_profile_id 
WHERE 
  1 = 1 AND 
  ( 
    user_profiles.swishjam_user_id = '1' OR 
    user_profiles.merged_into_swishjam_user_id = '1' 
  ) 
ORDER BY occurred_at DESC 
LIMIT 10