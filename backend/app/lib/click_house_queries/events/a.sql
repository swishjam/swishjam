SELECT CAST(SUM(JSONExtractFloat(e.user_properties, 'num_restaurants')) AS FLOAT) AS sum, DATE_TRUNC('hour', e.occurred_at) AS group_by_date FROM (SELECT e.uuid AS uuid, MAX(occurred_at) AS occurred_at, argMax(e.name, e.occurred_at) AS name FROM events AS e WHERE e.swishjam_api_key IN ('public--swishjam_prdct-668e3079a79d9145', 'public--swishjam_web-2fdd6acdbd98a149') AND e.occurred_at BETWEEN '2024-04-19 00:00:00' AND '2024-04-26 01:59:59' AND e.name = 'page_view' GROUP BY uuid ) AS e WHERE notEmpty(JSONExtractString(e.user_properties, 'num_restaurants')) AND 1 = 1 AND 1 = 1 AND (1=1 ) GROUP BY group_by_date ORDER BY group_by_date