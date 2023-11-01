import { UUID } from "./uuid.mjs";
import { CookieHelper } from "./cookieHelper.mjs";
import { SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME, SWISHJAM_ORGANIZATION_DEVICE_IDENTIFIER_COOKIE_NAME } from './constants.mjs'

export class DeviceIdentifiers {
  static getUserDeviceIdentifierValue = () => {
    return CookieHelper.getCookie(SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME) || this._setCookie('user');
  }

  static getOrganizationDeviceIdentifierValue = () => {
    return CookieHelper.getCookie(SWISHJAM_ORGANIZATION_DEVICE_IDENTIFIER_COOKIE_NAME) || this._setCookie('org');
  }

  static resetUserDeviceIdentifierValue = () => {
    CookieHelper.deleteCookie(SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME);
    return this._setCookie(SWISHJAM_USER_DEVICE_IDENTIFIER_COOKIE_NAME, 'user');
  }

  static resetOrganizationDeviceIdentifierValue = () => {
    CookieHelper.deleteCookie(SWISHJAM_ORGANIZATION_DEVICE_IDENTIFIER_COOKIE_NAME);
    return this._setCookie(SWISHJAM_ORGANIZATION_DEVICE_IDENTIFIER_COOKIE_NAME, 'org');
  }

  static resetAllDeviceIdentifierValues = () => {
    this.resetUserDeviceIdentifierValue();
    this.resetOrganizationDeviceIdentifierValue();
  }

  static _setCookie = (cookieName, prefix) => {
    const identifier = UUID.generate(prefix);
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    CookieHelper.setCookie({ name: cookieName, value: identifier, expiresIn: oneYear });
    return identifier;
  }
}

export default DeviceIdentifiers;