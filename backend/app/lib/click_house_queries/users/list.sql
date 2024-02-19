SELECT
  concat (
    toString (toDateTime (user_profiles.created_at), 'UTC'),
    ' GMT-0800'
  ) AS created_at,
  user_profiles.merged_into_swishjam_user_id AS merged_into_swishjam_user_id
FROM
  (
    SELECT
      swishjam_user_id,
      argMax (created_at, updated_at) AS created_at,
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
      CAST(COUNT(DISTINCT e.uuid) AS INT) AS event_count_for_user_within_lookback_period
    FROM
      events AS e
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
      ) AS finalized_user_profiles ON e.user_profile_id = finalized_user_profiles.user_profile_id_at_time_of_event
    WHERE
      e.name = 'added seat'
      AND date_diff ('minute', e.occurred_at, now (), 'UTC') <= 20160
    GROUP BY
      user_profile_id
  ) AS added_seat_event_count_for_user_within_last_14_days ON user_profiles.swishjam_user_id = added_seat_event_count_for_user_within_last_14_days.user_profile_id
WHERE
  isNull (user_profiles.merged_into_swishjam_user_id)
  AND (
    LOWER(JSONExtractString (metadata, 'favorite beer')) = 'coors'
    or LOWER(JSONExtractString (metadata, 'favorite color')) = 'blue'
  )
  or (
    added_seat_event_count_for_user_within_last_14_days.event_count_for_user_within_lookback_period >= 4
  )
ORDER BY
  user_profiles.created_at DESC
LIMIT
  1000
OFFSET
  0