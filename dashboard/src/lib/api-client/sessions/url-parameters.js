import Base from "../base";

export class UrlParameters extends Base {
  static async barChart({ queryParam, queryParams, timeframe } = {}) {
    return await this._get('/api/v1/sessions/url_parameters/bar_chart', { query_param: queryParam, query_params: queryParams, timeframe });
  }
}

Object.assign(UrlParameters, Base);
export default UrlParameters;