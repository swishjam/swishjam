export class API {
  static async get(url, data) {
    const queryParams = new URLSearchParams(this._params(data));
    const response = await fetch(`${url}?${queryParams}`);
    return await response.json();
  }

  static _params(data) {
    const { public_id: projectKey } = JSON.parse(localStorage.getItem('currentProject') || '{}');
    return { projectKey, ...data };
  }
}