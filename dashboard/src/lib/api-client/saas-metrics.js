import Base from "./base";
import ChurnRate from "./saas-metrics/churn-rate";

export class SaasMetrics extends Base {
  static ChurnRate = ChurnRate;
}

Object.assign(SaasMetrics, Base);
export default SaasMetrics;
