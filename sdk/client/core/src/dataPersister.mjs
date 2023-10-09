export class DataPersister {
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
}

export default DataPersister;