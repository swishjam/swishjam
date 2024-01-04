import Admin from './admin';
import Auth from './auth';
import BillingData from './billing-data';
import Config from './config';
import DashboardComponents from './dashboard-components';
import Dashboards from './dashboards';
import DoNotEnrichUserProfileRules from './do-not-enrich-user-profile-rules';
import EventTriggers from './event-triggers';
import Events from './events';
import GoogleSearchConsole from './google-search-console';
import Integrations from './integrations';
import Organizations from './organizations';
import PageViews from './page-views';
import RetentionCohorts from './retention_cohorts';
import Search from './search';
import Sessions from './sessions';
import Slack from './slack';
import SlackConnections from './slack-connections';
import Team from './team';
import Users from './users';
import Workspace from './workspace';
import WorkspaceInvitations from './workspace-invitations';
import WorkspaceMembers from './workspace-members';
import WorkspaceSettings from './workspace-settings';
import Reports from './reports';


export class SwishjamAPI {
  static Admin = Admin;
  static Auth = Auth;
  static BillingData = BillingData;
  static Config = Config;
  static Dashboards = Dashboards;
  static DashboardComponents = DashboardComponents;
  static DoNotEnrichUserProfileRules = DoNotEnrichUserProfileRules;
  static Events = Events;
  static EventTriggers = EventTriggers;
  static GoogleSearchConsole = GoogleSearchConsole;
  static Integrations = Integrations;
  static Organizations = Organizations;
  static PageViews = PageViews;
  static RetentionCohorts = RetentionCohorts;
  static Search = Search;
  static Sessions = Sessions;
  static Slack = Slack;
  static SlackConnections = SlackConnections;
  static Team = Team;
  static Users = Users;
  static Workspace = Workspace;
  static WorkspaceInvitations = WorkspaceInvitations;
  static WorkspaceMembers = WorkspaceMembers;
  static WorkspaceSettings = WorkspaceSettings;
  static Reports = Reports;
}

export default SwishjamAPI;