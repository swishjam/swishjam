SELECT
  CAST(COUNT(DISTINCT distinct_count_field) AS int) AS count,
  DATE_TRUNC ('day', occurred_at) AS group_by_date
FROM
  (
    SELECT
      JSONExtractString (e.properties, 'my_unique_prop') AS distinct_count_field,
      argMax (e.name, ingested_at) AS name,
      argMax (e.properties, ingested_at) AS properties,
      argMax (e.user_profile_id, ingested_at) AS user_profile_id,
      argMax (e.occurred_at, ingested_at) AS occurred_at
    FROM
      events AS e
    WHERE
      e.swishjam_api_key IN ('my_public_key')
      AND e.occurred_at BETWEEN '2024-01-27 00:00:00' AND '2024-01-29 23:59:59'
    GROUP BY
      distinct_count_field
  ) AS e
WHERE
  notEmpty (e.distinct_count_field)
  AND e.name = 'event_1'
GROUP BY
  group_by_date
ORDER BY
  group_by_date