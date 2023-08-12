const API_HOST = process.env.NEXT_PUBLIC_API_HOST || 'https://api.swishjam.com';

export class API {
  static async get(urlPath, data = {}) {
    return await API._request('GET', urlPath, data);
  }

  static async post(urlPath, data = {}) {
    return await API._request('POST', urlPath, data);
  }

  static async delete(urlPath) {
    return await API._request('DELETE', urlPath);
  }

  static async patch(urlPath, data = {}) {
    return await API._request('PATCH', urlPath, data);
  }

  static async _request(method, urlPath, data = {}) {
    const opts = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Swishjam-Token': localStorage.getItem('swishjam-token'),
      },
    };
    if (method !== 'GET') {
      opts.body = JSON.stringify(data);
    }
    const response = await fetch(`${API_HOST}${urlPath}`, opts);
    return await response.json();
  }

  // static _params(data) {
  //   const projectKey = SwishjamMemory.get('currentProjectKey');
  //   const project = SwishjamMemory.get('currentProjectName');
  //   const organizationId = SwishjamMemory.get('currentOrganization');
  //   return { projectKey, project, organizationId, ...data };
  // }
}