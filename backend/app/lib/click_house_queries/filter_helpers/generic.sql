SELECT 
user_profiles.email AS email, 
user_profiles.metadata AS metadata, 
user_profiles.first_seen_at_in_web_app AS first_seen_at_in_web_app, 
concat(toString(toDateTime(user_profiles.created_at), 'UTC'), ' GMT-0800') AS created_at, 
user_profiles.merged_into_swishjam_user_id AS merged_into_swishjam_user_id, 
active_user_event_event_count_for_user_within_last_7_days.event_count_for_user_within_lookback_period AS active_user_event_count_for_user 
FROM (
  SELECT 
    swishjam_user_id, 
    argMax(email, updated_at) AS email, 
    argMax(metadata, updated_at) AS metadata, 
    argMax(first_seen_at_in_web_app, updated_at) AS first_seen_at_in_web_app, 
    argMax(created_at, updated_at) AS created_at, 
    argMax(merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id 
  FROM swishjam_user_profiles 
  WHERE workspace_id = '40e99a11-9abf-4463-a973-fd4471f9514d' 
  GROUP BY swishjam_user_id 
) AS user_profiles 
LEFT JOIN ( 
  SELECT 
    finalized_user_profiles.finalized_swishjam_user_id AS user_profile_id, 
    CAST(COUNT(DISTINCT e.uuid) AS INT) AS event_count_for_user_within_lookback_period 
  FROM events AS e 
  LEFT JOIN ( 
    SELECT 
      swishjam_user_id AS user_profile_id_at_time_of_event, 
      argMax (merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id, 
      IF ( 
        isNull (merged_into_swishjam_user_id), 
        user_profile_id_at_time_of_event, 
        merged_into_swishjam_user_id 
      ) AS finalized_swishjam_user_id 
    FROM swishjam_user_profiles 
    WHERE workspace_id = '40e99a11-9abf-4463-a973-fd4471f9514d' 
    GROUP BY user_profile_id_at_time_of_event 
  ) AS finalized_user_profiles ON e.user_profile_id = finalized_user_profiles.user_profile_id_at_time_of_event 
  WHERE 
    e.name = 'active_user_event' AND 
    date_diff ('minute', e.occurred_at, now(), 'UTC') <= 10080 
  GROUP BY user_profile_id 
) AS active_user_event_event_count_for_user_within_last_7_days ON user_profiles.swishjam_user_id = active_user_event_event_count_for_user_within_last_7_days.user_profile_id 
WHERE 
  isNull(user_profiles.merged_into_swishjam_user_id) 
  AND (
    ( 
      ( 
        ( 
          notEmpty(user_profiles.email) AND 
          isNotNull(user_profiles.email) AND 
          arrayElement( splitByChar('@', assumeNotNull(user_profiles.email)), length(splitByChar('@', assumeNotNull(user_profiles.email))) ) NOT IN ['aol.com', 'aol.info', 'aol.net', 'aol.ru', 'aol.org', 'fastmail.com', 'fastmail.info', 'fastmail.net', 'fastmail.ru', 'fastmail.org', 'gmx.com', 'gmx.info', 'gmx.net', 'gmx.ru', 'gmx.org', 'gmail.com', 'gmail.info', 'gmail.net', 'gmail.ru', 'gmail.org', 'hotmail.com', 'hotmail.info', 'hotmail.net', 'hotmail.ru', 'hotmail.org', 'hushmail.com', 'hushmail.info', 'hushmail.net', 'hushmail.ru', 'hushmail.org', 'icloud.com', 'icloud.info', 'icloud.net', 'icloud.ru', 'icloud.org', 'inbox.com', 'inbox.info', 'inbox.net', 'inbox.ru', 'inbox.org', 'list.com', 'list.info', 'list.net', 'list.ru', 'list.org', 'live.com', 'live.info', 'live.net', 'live.ru', 'live.org', 'mail.com', 'mail.info', 'mail.net', 'mail.ru', 'mail.org', 'outlook.com', 'outlook.info', 'outlook.net', 'outlook.ru', 'outlook.org', 'proton.com', 'proton.info', 'proton.net', 'proton.ru', 'proton.org', 'protonmail.com', 'protonmail.info', 'protonmail.net', 'protonmail.ru', 'protonmail.org', 'qq.com', 'qq.info', 'qq.net', 'qq.ru', 'qq.org', 'tutanota.com', 'tutanota.info', 'tutanota.net', 'tutanota.ru', 'tutanota.org', 'ya.com', 'ya.info', 'ya.net', 'ya.ru', 'ya.org', 'yandex.com', 'yandex.info', 'yandex.net', 'yandex.ru', 'yandex.org', 'yahoo.com', 'yahoo.info', 'yahoo.net', 'yahoo.ru', 'yahoo.org', 'zoho.com', 'zoho.info', 'zoho.net', 'zoho.ru', 'zoho.org'] 
        ) AND 
        active_user_event_event_count_for_user_within_last_7_days.event_count_for_user_within_lookback_period >= 2 
      ) 
    ) 
  ) 
  ORDER BY user_profiles.created_at DESC 
  LIMIT 25 OFFSET 0