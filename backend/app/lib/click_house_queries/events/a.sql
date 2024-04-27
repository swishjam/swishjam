WITH ranked_properties AS ( 
  SELECT 
    JSONExtractString(e.user_properties, 'num_restaurants') AS num_restaurants,
    CAST(COUNT(DISTINCT e.uuid) AS INT) as total_count, 
    RANK() OVER (ORDER BY COUNT() DESC) as rank 
  FROM events AS e 
  WHERE 
    swishjam_api_key IN ('public--swishjam_prdct-668e3079a79d9145', 'public--swishjam_web-2fdd6acdbd98a149') AND 
    occurred_at BETWEEN '2024-04-20 00:00:00' AND '2024-04-27 02:59:59' AND 
    name = 'page_view' AND 
    (LOWER(JSONExtractString(e.user_properties, 'firstName')) LIKE '%john%') 
  GROUP BY num_restaurants 
) 
SELECT 
  CASE 
  WHEN rr.rank <= 10 
  THEN JSONExtractString(e.user_properties, 'num_restaurants') 
  ELSE 'Other' 
  END AS num_restaurants, 
  DATE_TRUNC('hour', e.occurred_at) AS group_by_date, 
  CAST(COUNT(DISTINCT e.uuid) AS INT) as count, 
  AVG(JSONExtractFloat(e.user_properties, 'num_restaurants')) AS avg 
FROM events AS e 
JOIN ranked_properties AS rr ON JSONExtractString(e.user_properties, 'num_restaurants') = rr.num_restaurants 
WHERE 
  e.swishjam_api_key IN ('public--swishjam_prdct-668e3079a79d9145', 'public--swishjam_web-2fdd6acdbd98a149') AND 
  e.occurred_at BETWEEN '2024-04-20 00:00:00' AND '2024-04-27 02:59:59' AND 
  e.name = 'page_view' AND 
  (LOWER(JSONExtractString(e.user_properties, 'firstName')) LIKE '%john%') AND 
  notEmpty(num_restaurants) 
GROUP BY group_by_date, num_restaurants 
ORDER BY group_by_date, avg