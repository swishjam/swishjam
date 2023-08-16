export class MemoryHandler {
  static set(key, value) {
    const currentMemory = MemoryHandler.all();
    currentMemory[key] = value;
    sessionStorage.setItem('swishjam', JSON.stringify(currentMemory));
    return value;
  }

  static get(key) {
    return MemoryHandler.all()[key];
  }

  static all() {
    return JSON.parse(sessionStorage.getItem('swishjam') || '{}');
  }
}