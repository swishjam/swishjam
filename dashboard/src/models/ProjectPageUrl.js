import { WebPageTestRunner } from '@/lib/web-page-test/web-page-test-runner';
import supabase from './supabaseClient'

export class ProjectPageUrl {
  static DB_COLUMNS = ['id', 'project_id', 'full_url', 'url_uniqueness_key', 'url_host', 'url_path', 'lab_test_cadence', 'lab_tests_enabled', 'created_at', 'updated_at'];

  constructor({ projectId, url, labTestCadence = 'never', labTestsEnabled = false, runFirstLabTest } = {}) {
    this.runFirstLabTest = runFirstLabTest;

    const parsedUrl = new URL(url);
    this._setAttrs({ 
      project_id: projectId, 
      full_url: url, 
      url_uniqueness_key: `${projectId}-${url}`,
      url_host: parsedUrl.host,
      url_path: parsedUrl.pathname,
      lab_test_cadence: labTestCadence, 
      lab_tests_enabled: labTestsEnabled 
    });
  }

  toJSON = this._attrs;

  static create = async ({ projectId, url, labTestCadence = 'never', labTestsEnabled = false, runFirstLabTest = true }) => {
    const { record, error } = await new ProjectPageUrl({ projectId, url, labTestCadence, labTestsEnabled, runFirstLabTest })._insert();
    if (!error) await record._afterCreate();
    return { record, error };
  }

  _attrs = () => {
    return ProjectPageUrl.DB_COLUMNS.reduce((attrs, column) => {
      attrs[column] = this[column];
      return attrs;
    }, {});
  }

  _setAttrs = attrs => {
    ProjectPageUrl.DB_COLUMNS.forEach(column => this[column] = attrs[column]);
    return this._attrs();
  }

  _insert = async () => {
    const { data, error } = await supabase.from('project_page_urls').insert(this._attrs()).select();
    if (!error) this._setAttrs(data[0]);
    return { record: this, error };
  }

  _afterCreate = async () => {
    if (!this.labTestsEnabled || !this.runFirstLabTest) return;
    await WebPageTestRunner.runSpeedTest({ url: this.full_url, projectKey: this.project_id });
  }
}