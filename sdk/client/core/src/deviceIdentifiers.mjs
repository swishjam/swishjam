import { UUID } from "./uuid.mjs";
import { CookieHelper } from "./cookieHelper.mjs";
import { SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME, SWISHJAM_ORGANIZATION_DEVICE_IDENTIFIER_COOKIE_NAME, LEGACY_SWISHJAM_ORGANIZATION_DEVICE_IDENTIFIER_COOKIE_NAME } from './constants.mjs'

const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000;

export class DeviceIdentifiers {
  static getUserDeviceIdentifierValue = () => {
    debugger;
    return CookieHelper.getCookie(SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME) || this._setCookie(SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME, { expiresIn: ONE_YEAR_IN_MS, prefix: 'user' });
  }

  static getOrganizationDeviceIdentifierValue = () => {
    CookieHelper.deleteCookie(LEGACY_SWISHJAM_ORGANIZATION_DEVICE_IDENTIFIER_COOKIE_NAME);
    return CookieHelper.getCookie(SWISHJAM_ORGANIZATION_DEVICE_IDENTIFIER_COOKIE_NAME) || this._setCookie(SWISHJAM_ORGANIZATION_DEVICE_IDENTIFIER_COOKIE_NAME, { expiresIn: null, prefix: 'org2' });
  }

  static resetUserDeviceIdentifierValue = () => {
    CookieHelper.deleteCookie(SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME);
    return this._setCookie(SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME, { expiresIn: ONE_YEAR_IN_MS, prefix: 'user' });
  }

  static resetOrganizationDeviceIdentifierValue = () => {
    CookieHelper.deleteCookie(SWISHJAM_ORGANIZATION_DEVICE_IDENTIFIER_COOKIE_NAME);
    return this._setCookie(SWISHJAM_ORGANIZATION_DEVICE_IDENTIFIER_COOKIE_NAME, { expiresIn: null, prefix: 'org' });
  }

  static resetAllDeviceIdentifierValues = () => {
    this.resetUserDeviceIdentifierValue();
    this.resetOrganizationDeviceIdentifierValue();
  }

  static _setCookie = (cookieName, options = {}) => {
    const expiresIn = options.expiresIn;
    const prefix = options.prefix || '';
    const identifier = UUID.generate(prefix);
    CookieHelper.setCookie({ name: cookieName, value: identifier, expiresIn });
    return identifier;
  }
}

export default DeviceIdentifiers;