export class Util {
  static generateUUID(prefix) {
    return `${prefix ? `${prefix}-` : ''}xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.replace(/x/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  static documentReferrerOrDirect() {
    return document.referrer === '' ? 'direct' : document.referrer;
  }

  static smartCookieDomain() {
    const hostname = window.location.hostname;
    const parts = hostname.split('.').reverse();
    if (parts.length > 2) {
      // This doesnt really work for all cases (ie: www.news.com.au), but good enough for now. Eventually we'll need a way to set the domain
      // Check if the second level domain is a common SLD (e.g., co.uk, com.au)
      if (parts[1].length === 2 && parts[0].length === 2) {
        // Domain like 'example.co.uk'
        return '.' + parts[2] + '.' + parts[1] + '.' + parts[0];
      } else {
        // Standard domains like 'example.com'
        return '.' + parts[1] + '.' + parts[0];
      }
    } else {
      // Localhost or similar
      return '.' + hostname;
    }
  }

  static jsonIsEqual(a, b) {
    return Util._stringifySorted(a) === Util._stringifySorted(b);
  }

  static _stringifySorted(obj) {
    if (Array.isArray(obj)) {
      return JSON.stringify(obj.map(stringifySorted));
    } else if (obj !== null && typeof obj === 'object') {
      return JSON.stringify(
        Object.keys(obj)
          .sort()
          .reduce((result, key) => {
            result[key] = Util._stringifySorted(obj[key]);
            return result;
          }, {})
      );
    }
    return JSON.stringify(obj);
  }
}

export default Util;