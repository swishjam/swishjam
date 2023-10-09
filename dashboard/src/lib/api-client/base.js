const API_HOST = process.env.NEXT_PUBLIC_API_HOST || 'https://api.swishjam.com';

const _filterUndefinedData = data => {
  return Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
}

export class Base {  
  static async _get(urlPath, data = {}) {
    return await this._request('GET', urlPath, data);
  }

  static async _post(urlPath, data = {}) {
    return await this._request('POST', urlPath, data);
  }

  static async _delete(urlPath) {
    return await this._request('DELETE', urlPath);
  }

  static async _patch(urlPath, data = {}) {
    return await this._request('PATCH', urlPath, data);
  }

  static async _request(method, urlPath, data = {}) {
    const filteredData = _filterUndefinedData(data);
    const opts = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Swishjam-Token': localStorage.getItem('swishjam-token'),
      },
    };
    if (method === 'GET') {
      urlPath += '?' + new URLSearchParams(filteredData).toString();
    } else {
      opts.body = JSON.stringify(filteredData);
    }
    const response = await fetch(`${API_HOST}${urlPath}`, opts);
    if (response.status === 401) {
      window.location.href = `/logout?return_url=${window.location.pathname}`
      return;
    }
    return await response.json();
  }
}

export default Base;