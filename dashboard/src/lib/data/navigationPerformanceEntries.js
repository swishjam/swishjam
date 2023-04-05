import db from '@lib/db';

export default class NavigationPerformanceEntries {
  static async getPercentilesForUrlHostAndPath({ projectKey, startTs, urlHost, urlPath, percentile }) {
    const query = `
      SELECT
        name,
        CAST(COUNT(name) AS int) AS total_count,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY start_time ASC) AS start_time,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY waiting_duration ASC) AS waiting_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY redirect_duration ASC) AS redirect_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY dns_lookup_duration ASC) AS dns_lookup_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY tcp_duration ASC) AS tcp_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY ssl_duration ASC) AS ssl_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY request_duration ASC) AS request_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY response_duration ASC) AS response_duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY transfer_size ASC) AS transfer_size,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY decoded_body_size ASC) AS decoded_body_size,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY encoded_body_size ASC) AS encoded_body_size,
        
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY dom_complete ASC) AS dom_complete,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY dom_interactive ASC) AS dom_interactive,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY dom_content_loaded_event_start ASC) AS dom_content_loaded_event_start,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY dom_content_loaded_event_end ASC) AS dom_content_loaded_event_end,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY load_event_end ASC) AS load_event_end,

        SUM(CASE WHEN transfer_size = 0 THEN 1 ELSE 0 END) AS local_cache_hit_count,
        SUM(CASE WHEN transfer_size > 0 THEN 1 ELSE 0 END) AS local_cache_miss_count,
        SUM(CASE WHEN encoded_body_size != decoded_body_size THEN 1 ELSE 0 END) AS compressed_count,
        SUM(CASE WHEN encoded_body_size != decoded_body_size THEN 0 ELSE 1 END) AS not_compressed_count
      FROM
        navigation_performance_entries
      JOIN
        page_views ON navigation_performance_entries.page_view_uuid = page_views.uuid
      WHERE
        page_views.project_key = $1 AND
        page_views.page_view_ts >= $2 AND
        page_views.url_host = $3 AND
        page_views.url_path = $4
      GROUP BY
        name
    `;
    return (await db.query(query, [projectKey, new Date(startTs), urlHost, urlPath])).rows;
  }

  static async getAveragesForUrlHostAndPath({ projectKey, startTs, urlHost, urlPath }) {
    const query = `
      SELECT
        name,
        AVG(duration) AS duration,
        AVG(dom_complete) AS dom_complete,
        AVG(dom_content_loaded_event_end) AS dom_content_loaded_event_end,
        AVG(dom_content_loaded_event_start) AS dom_content_loaded_event_start,
        AVG(dom_interactive) AS dom_interactive,
        AVG(load_event_end) AS load_event_end,
        AVG(load_event_start) AS load_event_start,
        AVG(unload_event_end) AS unload_event_end,
        AVG(unload_event_start) AS unload_event_start,
        AVG(connect_end) AS connect_end,
        AVG(connect_start) AS connect_start,
        AVG(decoded_body_size) AS decoded_body_size,
        AVG(domain_lookup_end) AS domain_lookup_end,
        AVG(domain_lookup_start) AS domain_lookup_start,
        AVG(encoded_body_size) AS encoded_body_size,
        AVG(fetch_start) AS fetch_start,
        AVG(redirect_end) AS redirect_end,
        AVG(redirect_start) AS redirect_start,
        AVG(request_start) AS request_start,
        AVG(response_end) AS response_end,
        AVG(response_start) AS response_start,
        AVG(response_status) AS response_status,
        AVG(secure_connection_start) AS secure_connection_start,
        AVG(transfer_size) AS transfer_size
      FROM
        navigation_performance_entries AS npe
      JOIN
        page_views ON navigation_performance_entries.page_view_uuid = page_views.uuid
      WHERE
        page_views.project_key = $1 AND
        page_views.page_view_ts >= $2 AND
        page_views.url_host = $3 AND
        page_views.url_path = $4
      GROUP BY
        npe.name
    `;
    return (await db.query(query, [projectKey, new Date(startTs), urlHost, urlPath])).rows;
  }
}