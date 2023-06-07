import supabase from './supabaseClient'

export class ProjectReportUrl {
  static DB_COLUMNS = ['id', 'project_id', 'full_url', 'url_uniqueness_key', 'url_host', 'url_path', 'cadence', 'enabled', 'created_at', 'updated_at', 'data_type', 'notification_type', 'notification_destination',''];

  constructor({ projectId, url, cadence = 'never', enabled = false, dataType, notificationType, notificationDestination } = {}) {

    const parsedUrl = new URL(url);
    this._setAttrs({ 
      project_id: projectId, 
      full_url: url, 
      url_uniqueness_key: `${projectId}-${url}`,
      url_host: parsedUrl.host,
      url_path: parsedUrl.pathname,
      cadence: cadence, 
      data_type: dataType, 
      notification_destination: notificationDestination,
      notification_type: notificationType,
      enabled: enabled 
    });
  }

  toJSON = this._attrs;

  static create = async ({ projectId, url, cadence = 'never', enabled = false, dataType, notificationType, notificationDestination }) => {
    const { record, error } = await new ProjectReportUrl({ projectId, url, cadence, enabled, dataType, notificationType, notificationDestination })._insert();
    return { record, error };
  }

  _attrs = () => {
    return ProjectReportUrl.DB_COLUMNS.reduce((attrs, column) => {
      attrs[column] = this[column];
      return attrs;
    }, {});
  }

  _setAttrs = attrs => {
    ProjectReportUrl.DB_COLUMNS.forEach(column => this[column] = attrs[column]);
    return this._attrs();
  }

  _insert = async () => {
    const { data, error } = await supabase.from('project_report_urls').insert(this._attrs()).select();
    if (!error) this._setAttrs(data[0]);
    return { record: this, error };
  }

}