import { toast } from "sonner";
import * as Sentry from '@sentry/nextjs';

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || 'https://api.swishjam.com';

const _filterUndefinedData = data => {
  return Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
}

export class Base {
  static async _get(urlPath, payload = {}) {
    const { dataSource: data_source } = payload;
    return await this._request('GET', urlPath, { data_source, ...payload });
  }

  static async _post(urlPath, payload = {}) {
    return await this._request('POST', urlPath, payload);
  }

  static async _delete(urlPath) {
    return await this._request('DELETE', urlPath);
  }

  static async _patch(urlPath, payload = {}) {
    return await this._request('PATCH', urlPath, payload);
  }

  static async _request(method, urlPath, payload = {}) {
    const filteredPayload = _filterUndefinedData(payload);
    const opts = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Swishjam-Token': localStorage.getItem('swishjam-token'),
      },
    };
    if (method === 'GET') {
      urlPath += '?' + new URLSearchParams(filteredPayload).toString();
    } else {
      opts.body = JSON.stringify(filteredPayload);
    }
    const response = await fetch(`${API_HOST}${urlPath}`, opts);
    if (response.status === 401) {
      window.location.href = `/logout?return_url=${window.location.pathname}`
      return {};
    } else if (response.status === 500) {
      Sentry.captureMessage('API 500 error in client', {
        extra: { method, urlPath, payload },
      })
      toast.error('An unexpected error occurred..', {
        description: 'We\'re actively looking into the issue. Please contact founders@swishjam.com for help.',
        duration: 10_000,
      })
      return { error: 'An unexpected error occurred.' };
    } else {
      return await response.json();
    }
  }
}

export default Base;