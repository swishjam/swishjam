import Admin from './admin';
import Auth from './auth';
import BillingData from './billing-data';
import Config from './config';
import Integrations from './integrations';
import Organizations from './organizations';
import PageViews from './page-views';
import RetentionCohorts from './retention_cohorts';
import Search from './search';
import Sessions from './sessions';
import Users from './users';
import Workspace from './workspace';

export class SwishjamAPI {
  static Admin = Admin;
  static Auth = Auth;
  static BillingData = BillingData;
  static Config = Config;
  static Integrations = Integrations;
  static Organizations = Organizations;
  static PageViews = PageViews;
  static RetentionCohorts = RetentionCohorts;
  static Search = Search;
  static Sessions = Sessions;
  static Users = Users;
  static Workspace = Workspace;
}

export default SwishjamAPI;