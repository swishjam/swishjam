import { Util } from "./util.mjs";
import { CookieHelper } from "./cookieHelper.mjs";
import { SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME } from './constants.mjs'

export class DeviceIdentifiers {
  static getUserDeviceIdentifierValue = () => {
    return CookieHelper.getCookie(SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME) || this._setCookie(SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME, 'user');
  }

  static resetUserDeviceIdentifierValue = () => {
    CookieHelper.deleteCookie(SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME);
    return this._setCookie(SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME, 'user');
  }

  static _setCookie = (cookieName, prefix = '') => {
    const identifier = Util.generateUUID(prefix);
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    CookieHelper.setCookie({ name: cookieName, value: identifier, expiresIn: oneYear });
    return identifier;
  }
}

export default DeviceIdentifiers;