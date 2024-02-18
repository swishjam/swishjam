SELECT
  dates.date AS time_period,
  SUM(
    IF (
      (
        JSONExtractString (
          finalized_user_profiles.metadata,
          'college attended'
        ) = 'Springfield'
        or added_seat_event_count_for_user_within_last_14_days.event_count_for_user_within_lookback_period >= 4
      ),
      1,
      0
    )
  ) AS user_count
FROM
  (
    SELECT
      toDateTime (
        subtractDays (toDateTime ('2024-02-19 00:00:00'), number)
      ) AS date
    FROM
      system.numbers
    LIMIT
      datediff (
        'day',
        toDateTime ('2024-01-19 00:00:00'),
        toDateTime ('2024-02-19 00:00:00')
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
          workspace_id = '104c4667-638b-4749-80d8-d1feb30d0636'
        GROUP BY
          user_profile_id_at_time_of_event
      ) AS finalized_user_profiles ON e.user_profile_id = finalized_user_profiles.user_profile_id_at_time_of_event
    WHERE
      e.name = 'added seat'
      AND date_diff (
        'minute',
        e.occurred_at,
        toDateTime (subtractMinutes (event_date, 20160)),
        'UTC'
      ) <= 20160
    GROUP BY
      user_profile_id,
      event_date
  ) AS added_seat_event_count_for_user_within_last_14_days ON dates.date = added_seat_event_count_for_user_within_last_14_days.event_date
GROUP BY
  time_period
ORDER BY
  time_period