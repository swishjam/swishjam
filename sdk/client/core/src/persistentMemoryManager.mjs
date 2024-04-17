import CookieHelper from "./cookieHelper.mjs";
import LZString from "lz-string";
import { SWISHJAM_PERSISTENT_USER_DATA_COOKIE_NAME } from "./constants.mjs";

export class PersistentMemoryManager {
  static markUserAsIdentified = () => {
    this.set('user_identified', true);
  }

  static userIsIdentified = () => {
    return this.get('user_identified');
  }

  static setOrganizationData = (uniqueIdentifier, attributes = {}) => {
    this.set('organization_data', { ...attributes, id: uniqueIdentifier })
  }

  static getOrganizationData = () => {
    let orgData = this.get('organization_data');
    if (!orgData) {
      orgData = JSON.parse(this.get('organization_metadata') || '{}');
      orgData.id = this.get('organization_identifier');
      orgData.name = this.get('organization_name');
      orgData = JSON.stringify(orgData);
    }
    return JSON.parse(orgData || '{}')
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

  static reset = () => {
    CookieHelper.deleteCookie(SWISHJAM_PERSISTENT_USER_DATA_COOKIE_NAME);
  }
}

export default PersistentMemoryManager;