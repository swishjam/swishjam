SELECT
  user_profiles.swishjam_user_id AS swishjam_user_id
FROM
  (
    SELECT
      swishjam_user_id,
      argMax (merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id,
      argMax (email, updated_at) AS email,
      argMax (metadata, updated_at) AS metadata,
      argMax (created_at, updated_at) AS created_at,
      argMax (first_seen_at_in_web_app, updated_at) AS first_seen_at_in_web_app
    FROM
      swishjam_user_profiles
    WHERE
      workspace_id = '30de1f62-0d6b-4138-be36-803952d3c8ef'
    GROUP BY
      swishjam_user_id
  ) AS user_profiles
  LEFT JOIN (
    SELECT
      finalized_user_profiles.finalized_swishjam_user_id AS user_profile_id,
      CAST(COUNT(DISTINCT uuid) AS INT) AS event_count_for_user_within_lookback_period
    FROM
      events
      LEFT JOIN (
        SELECT
          swishjam_user_id AS user_profile_id_at_time_of_event,
          argMax (merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id,
          IF (
            isNull (merged_into_swishjam_user_id),
            user_profile_id_at_time_of_event,
            merged_into_swishjam_user_id
          ) AS finalized_swishjam_user_id
        FROM
          swishjam_user_profiles
        GROUP BY
          user_profile_id_at_time_of_event
      ) AS finalized_user_profiles ON events.user_profile_id = finalized_user_profiles.user_profile_id_at_time_of_event
    WHERE
      name = 'dashboard_viewed'
      AND date_diff ('minute', occurred_at, now (), 'UTC') <= 43200
    GROUP BY
      user_profile_id
  ) AS dashboard_viewed_count_for_user ON user_profiles.swishjam_user_id = dashboard_viewed_count_for_user.user_profile_id
WHERE
  isNull (user_profiles.merged_into_swishjam_user_id)
  AND (
    dashboard_viewed_count_for_user.event_count_for_user_within_lookback_period >= 5
  )
ORDER BY
  user_profiles.created_at DESC
LIMIT
  1000
OFFSET
  0