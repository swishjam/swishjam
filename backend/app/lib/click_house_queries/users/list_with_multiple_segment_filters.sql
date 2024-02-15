SELECT user_profiles.swishjam_user_id AS swishjam_user_id, user_profiles.email AS email, user_profiles.metadata AS metadata, concat(toString(toDateTime(created_at), 'UTC'), ' GMT-0800') AS created_at, user_profiles.first_seen_at_in_web_app AS first_seen_at_in_web_app FROM ( SELECT swishjam_user_id, argMax(merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id, argMax(email, updated_at) AS email, argMax(metadata, updated_at) AS metadata, argMax(created_at, updated_at) AS created_at, argMax(first_seen_at_in_web_app, updated_at) AS first_seen_at_in_web_app FROM swishjam_user_profiles WHERE workspace_id = '72b06fe4-0a88-43f3-828a-9e8fab13bb70' GROUP BY swishjam_user_id ) AS user_profiles LEFT JOIN ( SELECT finalized_user_profiles.finalized_swishjam_user_id AS user_profile_id, CAST(COUNT(DISTINCT uuid) AS INT) AS event_count_for_user_within_lookback_period FROM events LEFT JOIN ( SELECT swishjam_user_id AS user_profile_id_at_time_of_event, argMax (merged_into_swishjam_user_id, updated_at) AS merged_into_swishjam_user_id, IF ( isNull (merged_into_swishjam_user_id), user_profile_id_at_time_of_event, merged_into_swishjam_user_id ) AS finalized_swishjam_user_id FROM swishjam_user_profiles GROUP BY user_profile_id_at_time_of_event ) AS finalized_user_profiles ON events.user_profile_id = finalized_user_profiles.user_profile_id_at_time_of_event WHERE name = 'active_user_event' AND date_diff ('minute', occurred_at, now(), 'UTC') <= 10080 GROUP BY user_profile_id ) AS active_user_event_count_for_user ON user_profiles.swishjam_user_id = active_user_event_count_for_user.user_profile_id WHERE isNull(user_profiles.merged_into_swishjam_user_id) AND ( active_user_event_count_for_user.event_count_for_user_within_lookback_period >= 2JSONExtractFloat(user_profiles.metadata, 'mrr') >= 100 ) ORDER BY user_profiles.created_at DESC LIMIT 25 OFFSET 0