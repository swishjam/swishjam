import Base from "./base";
import ChurnRate from "./saas-metrics/churn-rate";
import Customers from "./saas-metrics/customers";
import Mrr from './saas-metrics/mrr';
import MrrMovement from "./saas-metrics/mrr-movement";
import RevenuePerCustomer from "./saas-metrics/revenue-per-customer";
import RevenueRetention from "./saas-metrics/revenue-retention";

export class SaasMetrics extends Base {
  static ChurnRate = ChurnRate;
  static Customers = Customers;
  static MrrMovement = MrrMovement;
  static Mrr = Mrr;
  static RevenuePerCustomer = RevenuePerCustomer;
  static RevenueRetention = RevenueRetention;
}

Object.assign(SaasMetrics, Base);
export default SaasMetrics;
