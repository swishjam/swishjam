import db from '@lib/db';

export default class Pages {
  static async getAllUrlsForProject({ projectKey, startTs }) {
    const query = `
      SELECT
        DISTINCT CONCAT(url_host, url_path) as url_host_and_path
      FROM
        page_views
      WHERE
        project_key = $1 AND
        page_view_ts >= $2
      ORDER BY
        url_host_and_path
    `;
    return (await db.query(query, [projectKey, new Date(startTs)])).rows;
  }

  static async getUniqueHostUrlsForProject({ projectKey, startTs }) {
    const query = `
      SELECT
        DISTINCT url_host
      FROM
        page_views
      WHERE
        project_key = $1 AND
        page_view_ts >= $2
      ORDER BY
        url_host
    `;
    return (await db.query(query, [projectKey, new Date(startTs)])).rows;
  }
  
  static async getUniquePathUrlsForProject({ projectKey, startTs, urlHosts }) {
    if (urlHosts && urlHosts.length > 0) {
      const query = `
        SELECT
          DISTINCT url_path
        FROM
          page_views
        WHERE
          project_key = $1 AND
          page_view_ts >= $2 AND
          url_host IN (${urlHosts.map(host => `\'${host}\'`).join(', ')})
        ORDER BY
          url_path
      `;
      return (await db.query(query, [projectKey, new Date(startTs)])).rows;
    } else {
      const query = `
        SELECT
          DISTINCT url_path
        FROM
          page_views
        WHERE
          project_key = $1 AND
          page_view_ts >= $2
        ORDER BY
          url_path
      `;
      return (await db.query(query, [projectKey, new Date(startTs)])).rows;
    }
  }
}