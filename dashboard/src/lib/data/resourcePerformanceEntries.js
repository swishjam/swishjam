import db from '@lib/db';

export default class ResourcePerformanceEntries {
  static async getAll({ 
    projectKey, 
    urlPath,
    urlHost,
    startTs, 
    percentile = 0.75,
    limit = 150,
    minimumOccurrences = 10,
  }) {
    const query = `
      SELECT
        CONCAT(rpe.name_to_url_host, rpe.name_to_url_path) AS name,
        rpe.initiator_type,
        rpe.render_blocking_status,
        COUNT(rpe.name) AS total_count,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.start_time ASC) AS start_time,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.domain_lookup_start ASC) AS domain_lookup_start,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.domain_lookup_end ASC) AS domain_lookup_end,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.connect_start ASC) AS connect_start,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.connect_end ASC) AS connect_end,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.secure_connection_start ASC) AS secure_connection_start,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.request_start ASC) AS request_start,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.response_start ASC) AS response_start,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.response_end ASC) AS response_end,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.duration ASC) AS duration,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.transfer_size ASC) AS transfer_size,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.decoded_body_size ASC) AS decoded_body_size,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY rpe.encoded_body_size ASC) AS encoded_body_size,
        SUM(CASE WHEN rpe.transfer_size = 0 THEN 1 ELSE 0 END) AS local_cache_hit_count,
        SUM(CASE WHEN rpe.transfer_size > 0 THEN 1 ELSE 0 END) AS local_cache_miss_count,
        SUM(CASE WHEN rpe.encoded_body_size != rpe.decoded_body_size THEN 1 ELSE 0 END) AS compressed_count,
        SUM(CASE WHEN rpe.encoded_body_size != rpe.decoded_body_size THEN 0 ELSE 1 END) AS not_compressed_count
      FROM
        resource_performance_entries as rpe
      JOIN
        page_views AS pv ON rpe.page_view_uuid = pv.uuid
      WHERE
        pv.project_key = $1 AND
        pv.url_host = $2 AND
        pv.url_path = $3 AND
        pv.page_view_ts >= $4
      GROUP BY
        name_to_url_host, name_to_url_path, initiator_type, render_blocking_status
      HAVING
        COUNT(name) >= ${minimumOccurrences}
      ORDER BY
        start_time ASC
      LIMIT ${limit}
    `;
    return (await db.query(query, [projectKey, urlHost, urlPath, new Date(startTs)])).rows;
  }

  static async getTimeseriesForMetric({ projectKey, resourceName, metric, startTs }) {
    const query = `
      SELECT
        rpe.name AS name,
        AVG(${metric}) AS metric,
        date_trunc('hour', pv.page_view_ts) AS hour,
        date_trunc('day', pv.page_view_ts) AS day
      FROM
        resource_performance_entries  AS rpe
      JOIN
        page_views AS pv ON rpe.page_view_uuid = pv.uuid
      WHERE
        pv.project_key = $1 AND
        rpe.name = $2 AND
        pv.page_view_ts >= $3 AND
        rpe.${metric} IS NOT NULL AND
        rpe.${metric} > 0
      GROUP BY
        day, hour, name
      ORDER BY
        day, hour ASC
    `;
    return (await db.query(query, [projectKey, decodeURIComponent(resourceName), new Date(startTs)])).rows;
  }
}