export class CookieHelper {
  static setCookie = ({ name, value, expiresIn, path, domain, secure }) => {
    let cookie = `${name}=${value}`;
    if (expiresIn) {
      const expires = new Date();
      expires.setTime(expires.getTime() + expiresIn);
      cookie += `; expires=${expires.toUTCString()}`;
    }
    if (path) {
      cookie += `; path=${path}`;
    }
    if (domain) {
      cookie += `; domain=${domain}`;
    }
    if (secure) {
      cookie += '; secure';
    }
    document.cookie = cookie;
  }

  static getCookie = name => {
    const cookies = document.cookie.split('; ');
    const cookieValue = cookies.find(row => row.startsWith(`${name}=`));
    if (cookieValue) {
      return cookieValue.split('=')[1];
    }
  }

  static deleteCookie = name => {
    this.setCookie({ name, value: '', expiresIn: -1 });
  }
}

export default CookieHelper;