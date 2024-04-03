SELECT
  user_profiles.swishjam_user_id AS swishjam_user_id,
  concat (
    toString (toDateTime (user_profiles.created_at), 'UTC'),
    ' GMT-0800'
  ) AS created_at
FROM
  (
    SELECT
      swishjam_user_id,
      argMax (swishjam_user_profiles.created_at, updated_at) AS created_at,
      argMax (
        swishjam_user_profiles.merged_into_swishjam_user_id,
        updated_at
      ) AS merged_into_swishjam_user_id
    FROM
      swishjam_user_profiles
    WHERE
      workspace_id = '104c4667-638b-4749-80d8-d1feb30d0636'
    GROUP BY
      swishjam_user_id
  ) AS user_profiles
WHERE
  isNull (user_profiles.merged_into_swishjam_user_id)
  AND (
    (
      JSONHas (user_profiles.metadata, 'gravatar_url') = 1
    )
  )
ORDER BY
  user_profiles.created_at DESC
LIMIT
  1000
OFFSET
  0