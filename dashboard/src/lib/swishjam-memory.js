const LOCAL_STORAGE_KEY = 'swishjam';

export class SwishjamMemory {
  static get(key) {
    return SwishjamMemory._all()[key];
  }

  static set(key, value) {
    const existingMemory = SwishjamMemory._all();
    existingMemory[key] = value;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingMemory));
  }

  static delete(key) {
    const existingMemory = SwishjamMemory._all();
    delete existingMemory[key];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingMemory));
  }

  static _all() {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
  }
}