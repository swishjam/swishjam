-- INSERT INTO
--   new_events (
--     uuid,
--     swishjam_api_key,
--     name,
--     user_profile_id,
--     properties,
--     user_properties,
--     swishjam_organization_id,
--     ingested_at,
--     occurred_at
--   )
SELECT
  e.uuid AS uuid,
  e.swishjam_api_key AS swishjam_api_key,
  name,
  IF (
    empty (
      JSONExtractString (e.properties, 'user_profile_id')
    ),
    user_profiles.swishjam_user_id,
    JSONExtractString (e.properties, 'user_profile_id')
  ) AS user_profile_id,
  e.properties AS properties,
  IF (
    empty (user_profiles.swishjam_user_id),
    '{}',
    concat (
      '{ "unique_identifier":  "',
      IF (
        empty (user_profiles.user_unique_identifier),
        '',
        user_profiles.user_unique_identifier
      ),
      '",',
      '"email": "',
      IF (
        empty (user_profiles.email),
        '',
        user_profiles.email
      ),
      '",',
      '"first_name": "',
      IF (
        empty (user_profiles.first_name),
        '',
        user_profiles.first_name
      ),
      '",',
      '"last_name": "',
      IF (
        empty (user_profiles.last_name),
        '',
        user_profiles.last_name
      ),
      '",',
      substring(
        user_profiles.metadata,
        2,
        length (user_profiles.metadata) - 2
      ),
      '}'
    )
  ) AS user_properties,
  organization_profiles.swishjam_organization_id AS swishjam_organization_id,
  e.ingested_at AS ingested_at,
  e.occurred_at AS occurred_at
FROM
  events AS e
  LEFT JOIN (
    SELECT
      device_identifier,
      argMax (swishjam_api_key, occurred_at) AS swishjam_api_key,
      MAX(occurred_at) AS max_occurred_at,
      argMax (swishjam_user_id, occurred_at) AS swishjam_user_id
    FROM
      user_identify_events AS uie
    GROUP BY
      device_identifier
  ) AS identify ON identify.device_identifier = JSONExtractString (e.properties, 'device_identifier')
  AND identify.swishjam_api_key = e.swishjam_api_key
  LEFT JOIN (
    SELECT
      swishjam_user_id,
      argMax (user_unique_identifier, updated_at) AS user_unique_identifier,
      argMax (email, updated_at) AS email,
      argMax (first_name, updated_at) AS first_name,
      argMax (last_name, updated_at) AS last_name,
      argMax (metadata, updated_at) AS metadata
    FROM
      swishjam_user_profiles
    GROUP BY
      swishjam_user_id
  ) as user_profiles ON user_profiles.swishjam_user_id = identify.swishjam_user_id
  OR user_profiles.swishjam_user_id = JSONExtractString (e.properties, 'user_profile_id')
  LEFT JOIN (
    SELECT
      argMax (organization_unique_identifier, updated_at) AS organization_unique_identifier,
      swishjam_organization_id
    FROM
      swishjam_organization_profiles
    GROUP BY
      swishjam_organization_id
  ) as organization_profiles ON organization_profiles.organization_unique_identifier = JSONExtractString (
    JSONExtractString (e.properties, 'organization_attributes'),
    'organization_identifier'
  )
ORDER BY
  e.occurred_at DESC
LIMIT
  100