SELECT
  dates.date AS time_period,
  SUM(
    IF (
      (
        test_count_for_user.event_count_for_user_within_lookback_period >= 2
        or JSONExtractString (
          finalized_user_profiles.metadata,
          'college_attended'
        ) = 'Springfield'
      ),
      1,
      0
    )
  ) AS user_count
FROM
  (
    SELECT
      toDateTime (
        subtractDays (toDateTime ('2024-02-18 00:00:00'), number)
      ) AS date
    FROM
      system.numbers
    LIMIT
      datediff (
        'day',
        toDateTime ('2024-01-18 00:00:00'),
        toDateTime ('2024-02-18 00:00:00')
      )
  ) AS dates
  LEFT JOIN (
    SELECT
      finalized_user_profiles.finalized_swishjam_user_id AS user_profile_id,
      toDateTime (e.occurred_at) AS event_date,
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
          workspace_id = '720b386b-f485-482b-bff0-a417b045625f'
        GROUP BY
          user_profile_id_at_time_of_event
      ) AS finalized_user_profiles ON e.user_profile_id = finalized_user_profiles.user_profile_id_at_time_of_event
    WHERE
      e.name = 'test'
      AND date_diff (
        'minute',
        e.occurred_at,
        toDateTime (subtractMinutes (event_date, 43200)),
        'UTC'
      ) <= 43200
    GROUP BY
      user_profile_id,
      event_date
  ) AS test_count_for_user ON dates.date = test_count_for_user.event_date
  LEFT JOIN (
    SELECT
      user_profile_at_time_of_event.swishjam_user_id AS og_swishjam_user_id,
      IF (
        isNull (
          user_profile_at_time_of_event.merged_into_swishjam_user_id
        ),
        user_profile_at_time_of_event.swishjam_user_id,
        user_profile_at_time_of_event.merged_into_swishjam_user_id
      ) AS swishjam_user_id,
      IF (
        isNull (
          user_profile_at_time_of_event.merged_into_swishjam_user_id
        ),
        user_profile_at_time_of_event.email,
        profile_user_was_merged_into.email
      ) AS email,
      IF (
        isNull (
          user_profile_at_time_of_event.merged_into_swishjam_user_id
        ),
        user_profile_at_time_of_event.metadata,
        profile_user_was_merged_into.metadata
      ) AS metadata
    FROM
      (
        SELECT
          swishjam_user_id,
          argMax (email, updated_at) AS email,
          argMax (metadata, updated_at) AS metadata,
          argMax (merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id
        FROM
          swishjam_user_profiles
        WHERE
          workspace_id = '720b386b-f485-482b-bff0-a417b045625f'
        GROUP BY
          swishjam_user_id
      ) AS user_profile_at_time_of_event
      LEFT JOIN (
        SELECT
          swishjam_user_id,
          argMax (email, updated_at) AS email,
          argMax (metadata, updated_at) AS metadata,
          argMax (merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id
        FROM
          swishjam_user_profiles
        WHERE
          workspace_id = '720b386b-f485-482b-bff0-a417b045625f'
        GROUP BY
          swishjam_user_id
      ) AS profile_user_was_merged_into ON user_profile_at_time_of_event.merged_into_swishjam_user_id = profile_user_was_merged_into.swishjam_user_id
  ) AS finalized_user_profiles ON finalized_user_profiles.og_swishjam_user_id = test_count_for_user.user_profile_id
GROUP BY
  time_period
ORDER BY
  time_period