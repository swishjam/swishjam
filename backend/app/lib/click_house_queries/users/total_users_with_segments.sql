SELECT
  CAST(COUNT(DISTINCT swishjam_user_id) AS INT) AS total_num_users
FROM
  swishjam_user_profiles
WHERE
  workspace_id = 'bb37f41b-cbc1-43a8-8331-2947af327018'
  AND isNull (merged_into_swishjam_user_id)
  AND (
    JSONExtractString (user_profiles.metadata, 'birthday') = '11/01/1992'
  )