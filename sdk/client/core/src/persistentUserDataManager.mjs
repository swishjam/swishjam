import CookieHelper from "./cookieHelper.mjs";
import LZString from "lz-string";

const COOKIE_NAME = 'swishjam_persistent';

export class PersistentUserDataManager {
  static setReferrerDataIfNecessary = referrer => {
    this.setIfNull('original_referrer', referrer || window.location.referrer || '');
  }

  static setUserAttributes = ({ email, firstName, lastName }) => {
    this.set('email', email);
    this.set('firstName', firstName);
    this.set('lastName', lastName);
  }

  static getAll = () => {
    const cookie = CookieHelper.getCookie(COOKIE_NAME);
    if (cookie) {
      return JSON.parse(LZString.decompressFromUTF16(cookie));
    }
    return {};
  }

  static get = key => {
    return this.getAll()[key];
  }

  static set = (key, value) => {
    const all = this.getAll();
    all[key] = value;
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    const compressedValue = LZString.compressToUTF16(JSON.stringify(all));
    return CookieHelper.setCookie({ name: COOKIE_NAME, value: compressedValue, expiresIn: oneYear });
  }

  static setIfNull = (key, value) => {
    const existingValue = this.get(key);
    if (!existingValue) {
      return this.set(key, value);
    }
  }

  static reset = () => {
    CookieHelper.deleteCookie(COOKIE_NAME);
  }
}

export default PersistentUserDataManager;