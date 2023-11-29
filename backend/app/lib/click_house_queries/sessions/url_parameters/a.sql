WITH ranked_properties AS ( 
  SELECT extractURLParameter(JSONExtractString(properties, 'url'), 'utm_medium') AS query_param, 
    COUNT() as total_count, 
    RANK() OVER (ORDER BY COUNT() DESC) as rank 
  FROM events 
  WHERE 
    swishjam_api_key IN ('swishjam_prdct-b0b9c03129fed6db', 'swishjam_mrkt-c7a0f02ce5e61062', 'swishjam_stripe-a9c448c7d6891086', 'swishjam_resend-e3d4f3b808410af3') AND 
    occurred_at BETWEEN '2023-05-01 00:00:00' AND '2023-11-30 23:59:59' AND 
    name = 'new_session' 
  GROUP BY query_param 
) 

SELECT 
  CASE 
    WHEN rr.rank <= 2 
    THEN extractURLParameter(JSONExtractString(e.properties, 'url'), 'utm_medium') 
    ELSE 'Other' 
  END AS query_param, 
  rr.rank AS rank,
  DATE_TRUNC('month', e.occurred_at) AS group_by_date, 
  CAST(COUNT() AS INT) AS count 
FROM events AS e 
JOIN ranked_properties AS rr ON extractURLParameter(JSONExtractString(properties, 'url'), 'utm_medium') = rr.query_param 
WHERE 
  e.swishjam_api_key IN ('swishjam_prdct-b0b9c03129fed6db', 'swishjam_mrkt-c7a0f02ce5e61062', 'swishjam_stripe-a9c448c7d6891086', 'swishjam_resend-e3d4f3b808410af3') AND 
  e.occurred_at BETWEEN '2023-05-01 00:00:00' AND '2023-11-30 23:59:59' AND 
  e.name = 'new_session' 
GROUP BY group_by_date, query_param, rank
ORDER BY group_by_date, count