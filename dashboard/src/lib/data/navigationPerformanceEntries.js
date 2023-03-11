import db from '@lib/db';

export default class NavigationPerformanceEntries {
  static async getAveragesForUrlHostAndPath({ projectKey, startTs, urlHost, urlPath }) {
    const query = `
      SELECT
        CONCAT(page_views.url_host, page_views.url_path) AS name,
        AVG(duration) AS average_duration,
        AVG(dom_complete) AS average_dom_complete,
        AVG(dom_content_loaded_event_end) AS average_dom_content_loaded_event_end,
        AVG(dom_content_loaded_event_start) AS average_dom_content_loaded_event_start,
        AVG(dom_interactive) AS average_dom_interactive,
        AVG(load_event_end) AS average_load_event_end,
        AVG(load_event_start) AS average_load_event_start,
        AVG(unload_event_end) AS average_unload_event_end,
        AVG(unload_event_start) AS average_unload_event_start,
        AVG(connect_end) AS average_connect_end,
        AVG(connect_start) AS average_connect_start,
        AVG(decoded_body_size) AS average_decoded_body_size,
        AVG(domain_lookup_end) AS average_domain_lookup_end,
        AVG(domain_lookup_start) AS average_domain_lookup_start,
        AVG(encoded_body_size) AS average_encoded_body_size,
        AVG(fetch_start) AS average_fetch_start,
        AVG(redirect_end) AS average_redirect_end,
        AVG(redirect_start) AS average_redirect_start,
        AVG(request_start) AS average_request_start,
        AVG(response_end) AS average_response_end,
        AVG(response_start) AS average_response_start,
        AVG(response_status) AS average_response_status,
        AVG(secure_connection_start) AS average_secure_connection_start,
        AVG(transfer_size) AS average_transfer_size
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
        page_views.url_host, page_views.url_path
    `;
    return (await db.query(query, [projectKey, new Date(startTs), urlHost, urlPath])).rows;
  }
}