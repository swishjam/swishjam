export class API {
  static async get(url, data) {
    const queryParams = new URLSearchParams(this._params(data));
    const response = await fetch(`${url}?${queryParams}`);
    return await response.json();
  }

  static _params(data) {
    const currentProject = localStorage.getItem('currentProject')
    if (currentProject) {
      const { public_id: projectKey } = JSON.parse(currentProject);
      if (!projectKey) throw new Error('No current project key found');
      return { projectKey, ...data };
    } else {
      throw new Error('No current project found');
    }
  }
}