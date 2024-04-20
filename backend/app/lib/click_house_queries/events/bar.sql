WITH ranked_properties AS ( 
  SELECT 
    JSONExtractString(e.user_properties, 'initial_referrer_url') AS user_initial_referrer_url, 
    CAST(COUNT(DISTINCT e.uuid) AS INT) as total_count, 
    RANK() OVER (ORDER BY COUNT() DESC) as rank 
  FROM events AS e 
  WHERE 
    swishjam_api_key IN ('public--swishjam_prdct-1b0a6a7373a638e4', 'public--swishjam_web-dd1138ba7725b5fd') AND 
    occurred_at BETWEEN '2024-03-20 00:00:00' AND '2024-04-19 23:59:59' AND 
    name = 'demo_requested' 
  GROUP BY user_initial_referrer_url 
) 
SELECT 
  CASE 
    WHEN rr.rank <= 10 
    THEN JSONExtractString(e.user_properties, 'initial_referrer_url') 
    ELSE 'Other' 
  END 
  AS user_initial_referrer_url, 
  DATE_TRUNC('day', e.occurred_at) AS group_by_date, 
  CAST(COUNT(DISTINCT e.uuid) AS INT) AS count 
FROM events AS e 
JOIN ranked_properties AS rr ON JSONExtractString(e.user_properties, 'initial_referrer_url') = rr.user_initial_referrer_url 
WHERE 
  e.swishjam_api_key IN ('public--swishjam_prdct-1b0a6a7373a638e4', 'public--swishjam_web-dd1138ba7725b5fd') AND 
  e.occurred_at BETWEEN '2024-03-20 00:00:00' AND '2024-04-19 23:59:59' AND 
  e.name = 'demo_requested' AND 
  notEmpty(user_initial_referrer_url) 
GROUP BY group_by_date, user_initial_referrer_url 
ORDER BY group_by_date, count

----

SELECT COUNT() AS count, JSONExtractString(user_properties, 'initial_referrer_url') AS initial_referrer_url
FROM events
WHERE (swishjam_api_key IN ('public--swishjam_prdct-1b0a6a7373a638e4', 'public--swishjam_web-dd1138ba7725b5fd')) AND (name = 'demo_requested')
GROUP BY initial_referrer_url