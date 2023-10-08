import Admin from './admin';
import Auth from './auth';
import BillingData from './billing-data';
import Config from './config';
import DashboardComponents from './dashboard-components';
import Dashboards from './dashboards';
import Events from './events';
import Integrations from './integrations';
import Organizations from './organizations';
import PageViews from './page-views';
import Search from './search';
import Sessions from './sessions';
import Users from './users';
import Workspace from './workspace';

export class SwishjamAPI {
  static Admin = Admin;
  static Auth = Auth;
  static BillingData = BillingData;
  static Config = Config;
  static Dashboards = Dashboards;
  static DashboardComponents = DashboardComponents;
  static Events = Events;
  static Integrations = Integrations;
  static Organizations = Organizations;
  static PageViews = PageViews;
  static Search = Search;
  static Sessions = Sessions;
  static Users = Users;
  static Workspace = Workspace;
}

export default SwishjamAPI;