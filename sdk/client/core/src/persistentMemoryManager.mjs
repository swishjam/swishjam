import CookieHelper from "./cookieHelper.mjs";
import LZString from "lz-string";
import { SWISHJAM_PERSISTENT_USER_DATA_COOKIE_NAME } from "./constants.mjs";

export class PersistentMemoryManager {
  static setCurrentUserData = userData => {
    return this.set('current_user', userData);
  }

  static updateCurrentUserData = traits => {
    const currentUserData = this.getCurrentUserData();
    return this.setCurrentUserData({ ...currentUserData, ...traits });
  }

  static getCurrentUserData = () => {
    return this.get('current_user') || {};
  }

  static userIsIdentified = () => {
    return this.getCurrentUserData().identifier !== undefined;
  }

  static setOrganizationData = orgData => {
    return this.set('organization_data', orgData)
  }

  static getOrganizationData = () => {
    let orgData = this.get('organization_data');
    if (!orgData) {
      // for backwards compatibility
      orgData = {
        id: this.get('organization_identifier'),
        name: this.get('organization_name'),
        ...(this.get('organization_metadata') || {})
      }
      Object.keys(orgData).forEach(key => orgData[key] === undefined && delete orgData[key]);
    }
    return orgData || {}
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
    CookieHelper.setCookie({ name: SWISHJAM_PERSISTENT_USER_DATA_COOKIE_NAME, value: compressedValue, expiresIn: oneYear });
    return value;
  }

  static reset = () => {
    CookieHelper.deleteCookie(SWISHJAM_PERSISTENT_USER_DATA_COOKIE_NAME);
  }
}

export default PersistentMemoryManager;