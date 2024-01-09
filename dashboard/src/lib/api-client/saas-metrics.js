import Base from "./base";
import ChurnRate from "./saas-metrics/churn-rate";
import Mrr from './saas-metrics/mrr';
import MrrMovement from "./saas-metrics/mrr-movement";
import RevenueRetention from "./saas-metrics/revenue-retention";

export class SaasMetrics extends Base {
  static ChurnRate = ChurnRate;
  static MrrMovement = MrrMovement;
  static Mrr = Mrr;
  static RevenueRetention = RevenueRetention;
}

Object.assign(SaasMetrics, Base);
export default SaasMetrics;
