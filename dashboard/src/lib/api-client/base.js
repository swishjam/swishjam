import { SwishjamMemory } from "@/lib/swishjam-memory";

export class API {
  static async get(url, data) {
    const queryParams = new URLSearchParams(this._params(data));
    const response = await fetch(`${url}?${queryParams}`);
    return await response.json();
  }

  static async post(url, data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(this._params(data))
    });
    return await response.json();
  }

  static _params(data) {
    const { public_id: projectKey } = JSON.parse(SwishjamMemory.get('currentProject') || '{}');
    return { projectKey, ...data };
  }
}