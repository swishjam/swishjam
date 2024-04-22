INSERT INTO
  events (
    uuid,
    swishjam_api_key,
    name,
    user_profile_id,
    organization_profile_id,
    properties,
    user_properties,
    organization_properties,
    occurred_at,
    ingested_at
  )
VALUES
  (
    'evt-1713297759141-031a375f-c87b-fac1-b513-5892d8f4e43f',
    'public--swishjam_web-7afd0c184689d461',
    'page_view',
    '3b8a6da6-5bce-409b-bf8f-bb3817654d41',
    NULL,
    '{\"referrer\":\"http://localhost:3000/solutions/web-analytics\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36\",\"browser_name\":\"Chrome\",\"browser_version\":\"123.0.0.0\",\"browser_major_version\":\"123\",\"os\":\"Mac OS\",\"os_version\":\"10.15.7\",\"device\":\"Macintosh\",\"device_vendor\":\"Apple\",\"is_mobile\":false,\"timezone\":\"-07\",\"language\":\"en-US\",\"system_language\":\"en-US\",\"session_referrer\":\"\",\"session_landing_page_url\":\"http://localhost:3000/\",\"session_utm_source\":null,\"session_utm_medium\":null,\"session_utm_campaign\":null,\"session_utm_term\":null,\"session_utm_content\":null,\"session_gclid\":null,\"page_view_identifier\":\"pv-a4d3fd85-e193-6fad-2167-2938d23c3eb9\",\"sdk_version\":\"0.0.5\",\"session_identifier\":\"s-d3228bf1-0540-d56c-d30d-ea67d5621ae7\",\"url\":\"http://localhost:3000/solutions/revenue-analytics\"}',
    '{\"initial_referrer_url\":\"\",\"initial_landing_page_url\":\"http://localhost:3000/\",\"email\":null,\"unique_identifier\":null,\"id\":\"3b8a6da6-5bce-409b-bf8f-bb3817654d41\"}',
    '{}',
    '2024-04-16 20:02:39.141',
    '2024-04-16 20:05:29.918'
  ),
  (
    'evt-1713297752159-44531669-f721-04b5-2651-6e24d53fa0c3',
    'public--swishjam_web-7afd0c184689d461',
    'page_left',
    '3b8a6da6-5bce-409b-bf8f-bb3817654d41',
    NULL,
    '{\"referrer\":\"http://localhost:3000/solutions/product-analytics\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36\",\"browser_name\":\"Chrome\",\"browser_version\":\"123.0.0.0\",\"browser_major_version\":\"123\",\"os\":\"Mac OS\",\"os_version\":\"10.15.7\",\"device\":\"Macintosh\",\"device_vendor\":\"Apple\",\"is_mobile\":false,\"timezone\":\"-07\",\"language\":\"en-US\",\"system_language\":\"en-US\",\"session_referrer\":\"\",\"session_landing_page_url\":\"http://localhost:3000/\",\"session_utm_source\":null,\"session_utm_medium\":null,\"session_utm_campaign\":null,\"session_utm_term\":null,\"session_utm_content\":null,\"session_gclid\":null,\"milliseconds_on_page\":414211,\"page_view_identifier\":\"pv-2839cddf-888b-23fc-e5f1-04221347beb3\",\"sdk_version\":\"0.0.5\",\"session_identifier\":\"s-d3228bf1-0540-d56c-d30d-ea67d5621ae7\",\"url\":\"http://localhost:3000/solutions/web-analytics\"}',
    '{\"initial_referrer_url\":\"\",\"initial_landing_page_url\":\"http://localhost:3000/\",\"email\":null,\"unique_identifier\":null,\"id\":\"3b8a6da6-5bce-409b-bf8f-bb3817654d41\"}',
    '{}',
    '2024-04-16 20:02:32.160',
    '2024-04-16 20:05:29.918'
  ),
  (
    'evt-1713297752154-9ba09ab2-4aeb-aa28-7fcd-60322aee0175',
    'public--swishjam_web-7afd0c184689d461',
    'click',
    '3b8a6da6-5bce-409b-bf8f-bb3817654d41',
    NULL,
    '{\"referrer\":\"http://localhost:3000/solutions/product-analytics\",\"user_agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36\",\"browser_name\":\"Chrome\",\"browser_version\":\"123.0.0.0\",\"browser_major_version\":\"123\",\"os\":\"Mac OS\",\"os_version\":\"10.15.7\",\"device\":\"Macintosh\",\"device_vendor\":\"Apple\",\"is_mobile\":false,\"timezone\":\"-07\",\"language\":\"en-US\",\"system_language\":\"en-US\",\"session_referrer\":\"\",\"session_landing_page_url\":\"http://localhost:3000/\",\"session_utm_source\":null,\"session_utm_medium\":null,\"session_utm_campaign\":null,\"session_utm_term\":null,\"session_utm_content\":null,\"session_gclid\":null,\"clicked_id\":\"\",\"clicked_class\":\"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground\",\"clicked_text\":\"Revenue Analytics\\n\\nTrack MRR, churn, LTV and more\",\"clicked_element\":\"A\",\"clicked_href\":\"http://localhost:3000/solutions/revenue-analytics\",\"page_view_identifier\":\"pv-2839cddf-888b-23fc-e5f1-04221347beb3\",\"sdk_version\":\"0.0.5\",\"session_identifier\":\"s-d3228bf1-0540-d56c-d30d-ea67d5621ae7\",\"url\":\"http://localhost:3000/solutions/web-analytics\"}',
    '{\"initial_referrer_url\":\"\",\"initial_landing_page_url\":\"http://localhost:3000/\",\"email\":null,\"unique_identifier\":null,\"id\":\"3b8a6da6-5bce-409b-bf8f-bb3817654d41\"}',
    '{}',
    '2024-04-16 20:02:32.154',
    '2024-04-16 20:05:29.918'
  )