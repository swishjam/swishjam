import CookieHelper from "./cookieHelper.mjs";
import LZString from "lz-string";
import { SWISHJAM_PERSISTENT_USER_DATA_COOKIE_NAME } from "./constants.mjs";

export class PersistentUserDataManager {
  static setUserAttributes = ({ userIdentifier, email, firstName, lastName, ...metadata }) => {
    if (userIdentifier) this.set('user_unique_identifier', userIdentifier);
    if (email) this.set('user_email', email);
    if (firstName) this.set('user_first_name', firstName);
    if (lastName) this.set('user_last_name', lastName);
    if (metadata) this.set('user_metadata', metadata);
  }

  static setOrganizationAttributes = ({ organizationIdentifier, organizationName, ...metadata }) => {
    if (organizationIdentifier) this.set('organization_identifier', organizationIdentifier);
    if (organizationName) this.set('organization_name', organizationName);
    if (metadata) this.set('organization_metadata', metadata);
  }

  static getAll = ({ except = [] } = {}) => {
    const cookie = CookieHelper.getCookie(SWISHJAM_PERSISTENT_USER_DATA_COOKIE_NAME);
    if (cookie) {
      const cookieVal = LZString.decompressFromUTF16(cookie);
      if (cookieVal === '') {
        return {};
      } else {
        const json = JSON.parse(cookieVal);
        except.forEach(key => delete json[key])
        return json;
      }
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
    return CookieHelper.setCookie({ name: SWISHJAM_PERSISTENT_USER_DATA_COOKIE_NAME, value: compressedValue, expiresIn: oneYear });
  }

  static setIfNull = (key, value) => {
    const existingValue = this.get(key);
    if (!existingValue) {
      return this.set(key, value);
    }
  }

  static reset = () => {
    CookieHelper.deleteCookie(SWISHJAM_PERSISTENT_USER_DATA_COOKIE_NAME);
  }
}

export default PersistentUserDataManager;