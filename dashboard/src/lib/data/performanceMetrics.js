import db from '../db';

export default class PerformanceMetricsData {
  static async getAverageMetric({ siteId, metric, startTs }) {
    const query = `
      SELECT 
        COUNT(*) AS num_records,
        AVG(metric_value) AS average
      FROM 
        performance_metrics 
      WHERE 
        site_id = $1 AND
        metric_name = $2 AND 
        created_at >= $3
    `;
    const results = await db.query(query, [siteId, metric, new Date(startTs)]);
    return {
      numRecords: results.rows[0].num_records,
      average: results.rows[0].average
    };
  }

  static async getPercentileMetric({ siteId, metric, percentile, startTs }) {
    const query = `
      SELECT
        COUNT(*) AS num_records,
        PERCENTILE_CONT(${percentile}) WITHIN GROUP (ORDER BY metric_value) AS percentile_result
      FROM
        performance_metrics
      WHERE
        site_id = $1 AND
        metric_name = $2 AND
        created_at >= $3
    `;
    const results = await db.query(query, [siteId, metric, new Date(startTs)]);
    return {
      numRecords: results.rows[0].num_records,
      percentileResult: results.rows[0].percentile_result
    };
  }
}