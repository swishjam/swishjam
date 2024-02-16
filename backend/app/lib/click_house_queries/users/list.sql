SELECT
  user_profiles.swishjam_user_id AS swishjam_user_id
FROM
  (
    SELECT
      swishjam_user_id,
      argMax (merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id
    FROM
      swishjam_user_profiles
    WHERE
      workspace_id = '104c4667-638b-4749-80d8-d1feb30d0636'
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
          workspace_id = '104c4667-638b-4749-80d8-d1feb30d0636'
        GROUP BY
          user_profile_id_at_time_of_event
      ) AS finalized_user_profiles ON events.user_profile_id = finalized_user_profiles.user_profile_id_at_time_of_event
    WHERE
      name = 'added seat'
      AND date_diff ('minute', occurred_at, now (), 'UTC') <= 20160
    GROUP BY
      user_profile_id
  ) AS added_seat_count_for_user ON user_profiles.swishjam_user_id = added_seat_count_for_user.user_profile_id
WHERE
  isNull (user_profiles.merged_into_swishjam_user_id)
  AND (
    JSONExtractString (metadata, 'college attended') = 'Springfield'
    or added_seat_count_for_user.event_count_for_user_within_lookback_period >= 4
  )
ORDER BY
  user_profiles.created_at DESC
LIMIT
  1000
OFFSET
  0