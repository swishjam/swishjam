import { SwishjamMemory } from "@/lib/swishjam-memory";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || 'https://api.swishjam.com';

export class API {
  static async get(urlPath, data) {
    const queryParams = new URLSearchParams(this._params(data));
    const response = await fetch(`${API_HOST}${urlPath}?${queryParams}`);
    return await response.json();
  }

  static async post(urlPath, data = {}) {
    const response = await fetch(`${API_HOST}${urlPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(this._params(data))
    });
    return await response.json();
  }

  static _params(data) {
    const projectKey = SwishjamMemory.get('currentProjectKey');
    const project = SwishjamMemory.get('currentProjectName');
    const organizationId = SwishjamMemory.get('currentOrganization');
    return { projectKey, project, organizationId, ...data };
  }
}