    SELECT 
      DATE_TRUNC('week', events.occurred_at) AS group_by_date,
      DATE_TRUNC('year', events.occurred_at) AS year,
      COUNT(DISTINCT user_profiles.finalized_swishjam_user_id) AS num_unique_users
    FROM (
      SELECT *,
        COUNT(*) OVER (
          PARTITION BY user_profiles.finalized_swishjam_user_id
          ORDER BY events.occurred_at
          RANGE BETWEEN INTERVAL '14 DAYS' PRECEDING AND CURRENT ROW
        ) as event_count_in_window
      FROM events
      LEFT JOIN (
        SELECT 
          swishjam_user_id, 
          argMax(merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id,
          IF(
            isNull(merged_into_swishjam_user_id), 
            swishjam_user_id, 
            merged_into_swishjam_user_id
          ) AS finalized_swishjam_user_id
        FROM swishjam_user_profiles
        GROUP BY swishjam_user_id
      ) AS user_profiles ON user_profiles.swishjam_user_id = events.user_profile_id
      WHERE
        events.occurred_at BETWEEN '2024-01-01 00:00:00' AND '2024-03-01 00:00:00' AND
        events.name = 'added seat'
    ) AS events_with_window
    WHERE event_count_in_window >= 2
    GROUP BY group_by_date, year
    ORDER BY group_by_date ASC