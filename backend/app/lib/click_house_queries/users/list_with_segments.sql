SELECT
  user_profiles.swishjam_user_id AS swishjam_user_id,
  user_profiles.email AS email,
  user_profiles.metadata AS metadata,
  concat (
    toString (toDateTime (created_at), 'UTC'),
    ' GMT-0800'
  ) AS created_at,
  user_profiles.first_seen_at_in_web_app AS first_seen_at_in_web_app
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
      workspace_id = 'ac7ae833-b318-470a-8392-7846742948a7'
    GROUP BY
      swishjam_user_id
  ) AS user_profiles
WHERE
  isNull (user_profiles.merged_into_swishjam_user_id)
  AND (
    JSONExtractString (user_profiles.metadata, 'birthday') = '11/01/1992'
  )
ORDER BY
  user_profiles.created_at DESC
LIMIT
  25
OFFSET
  0