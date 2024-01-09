import Base from "../base";

export class RevenueRetention extends Base {
  static async get({ numCohorts = 8 } = {}) {
    return await this._get('/api/v1/saas_metrics/revenue_retention', { num_cohorts: numCohorts });
  }
}

Object.assign(Base, RevenueRetention);
export default RevenueRetention;