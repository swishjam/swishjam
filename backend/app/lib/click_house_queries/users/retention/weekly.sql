SELECT 
  cohort_period AS cohort_period, 
  activity_period AS activity_period, 
  CAST(COUNT(DISTINCT swishjam_user_id) AS INT) AS num_active_users 
FROM ( 
  SELECT 
    swishjam_user_profiles.swishjam_user_id AS swishjam_user_id, 
    toStartOfWeek(swishjam_user_profiles.created_at, 1) AS cohort_period, 
    toStartOfWeek(e.occurred_at, 1) AS activity_period,
    e.name 
  FROM swishjam_user_profiles 
  INNER JOIN ( 
    SELECT 
      device_identifier, 
      argMax(swishjam_user_id, occurred_at) AS swishjam_user_id 
    FROM user_identify_events 
    WHERE swishjam_api_key in ('swishjam_prdct-a91089315330dc79') 
    GROUP BY device_identifier 
  ) AS uie ON swishjam_user_profiles.swishjam_user_id = uie.swishjam_user_id 
  INNER JOIN events AS e ON 
    JSONExtractString(e.properties, 'device_identifier') = uie.device_identifier AND 
    e.occurred_at >= '2023-10-23 00:00:00' AND 
    e.name IN ('my_active_user_event') AND
    e.swishjam_api_key IN ('swishjam_prdct-a91089315330dc79')
  WHERE 
    swishjam_user_profiles.swishjam_api_key IN ('swishjam_prdct-a91089315330dc79') AND 
    swishjam_user_profiles.created_at >= '2023-10-23 00:00:00' 
) subquery 
GROUP BY cohort_period, activity_period 
ORDER BY cohort_period, activity_period