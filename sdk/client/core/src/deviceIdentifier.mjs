import { UUID } from "./uuid.mjs";
import { CookieHelper } from "./cookieHelper.mjs";
import { SWISHJAM_DEVICE_IDENTIFIER_COOKIE_NAME } from './constants.mjs'

export class DeviceIdentifier {
  static getDeviceIdentifierValue = () => {
    return this._getDeviceIdentifierValue() || this._setDeviceIdentifierValue();
  }

  static resetDeviceIdentifierValue = () => {
    CookieHelper.deleteCookie(SWISHJAM_DEVICE_IDENTIFIER_COOKIE_NAME);
    return this._setDeviceIdentifierValue();
  }

  static _getDeviceIdentifierValue = () => {
    return CookieHelper.getCookie(SWISHJAM_DEVICE_IDENTIFIER_COOKIE_NAME);
  }

  static _setDeviceIdentifierValue = () => {
    const identifier = UUID.generate('di');
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    CookieHelper.setCookie({ name: SWISHJAM_DEVICE_IDENTIFIER_COOKIE_NAME, value: identifier, expiresIn: oneYear });
    return identifier;
  }
}