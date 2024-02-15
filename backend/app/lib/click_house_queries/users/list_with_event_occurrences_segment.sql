SELECT
  user_profiles.swishjam_user_id AS swishjam_user_id,
  user_profiles.email AS email,
  user_profiles.metadata AS metadata,
  concat (
    toString (toDateTime (created_at), 'UTC'),
    ' GMT-0800'
  ) AS created_at,
  active_user_event_event_counts_for_user.event_count_for_user_within_lookback_period AS event_count
FROM
  (
    SELECT
      swishjam_user_id,
      argMax (merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id,
      argMax (email, updated_at) AS email,
      argMax (metadata, updated_at) AS metadata,
      argMax (created_at, updated_at) AS created_at
    FROM
      swishjam_user_profiles
    WHERE
      workspace_id = 'ea94c98e-3c4b-40c0-9b93-4876baafb0d7'
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
        WHERE
          workspace_id = 'ea94c98e-3c4b-40c0-9b93-4876baafb0d7'
        GROUP BY
          user_profile_id_at_time_of_event
      ) AS finalized_user_profiles ON events.user_profile_id = finalized_user_profiles.user_profile_id_at_time_of_event
    WHERE
      name = 'active_user_event'
      AND date_diff ('minute', occurred_at, now (), 'UTC') <= 10080
    GROUP BY
      user_profile_id
  ) AS active_user_event_event_counts_for_user ON user_profiles.swishjam_user_id = active_user_event_event_counts_for_user.user_profile_id
WHERE
  isNull (user_profiles.merged_into_swishjam_user_id)
  AND (
    active_user_event_event_counts_for_user.event_count_for_user_within_lookback_period >= 2
  )
ORDER BY
  user_profiles.created_at DESC
LIMIT
  25
OFFSET
  0