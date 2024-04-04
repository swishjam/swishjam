SELECT DISTINCT
  property_name
FROM
  (
    SELECT
      u.swishjam_user_id,
      argMax (
        u.metadata,
        IF (
          isNull (u.last_updated_from_transactional_db_at),
          u.updated_at,
          u.last_updated_from_transactional_db_at
        )
      ) AS metadata,
      argMax (
        u.merged_into_swishjam_user_id,
        IF (
          isNull (u.last_updated_from_transactional_db_at),
          u.updated_at,
          u.last_updated_from_transactional_db_at
        )
      ) AS merged_into_swishjam_user_id
    FROM
      swishjam_user_profiles AS u
    WHERE
      u.workspace_id = '104c4667-638b-4749-80d8-d1feb30d0636'
    GROUP BY
      swishjam_user_id
  ) ARRAY
  JOIN JSONExtractKeys (metadata) AS property_name
WHERE
  isValidJSON (metadata) = 1
LIMIT
  100