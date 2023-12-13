export class SessionPersistance {
  static set(key, value) {
    const currentMemory = this.all();
    currentMemory[key] = value;
    sessionStorage.setItem('swishjam', JSON.stringify(currentMemory));
    return value;
  }

  static get(key) {
    return this.all()[key];
  }

  static all() {
    return JSON.parse(sessionStorage.getItem('swishjam') || '{}');
  }

  static clear() {
    sessionStorage.removeItem('swishjam');
  }
}

export default SessionPersistance;