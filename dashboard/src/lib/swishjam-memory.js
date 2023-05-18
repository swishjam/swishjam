'use client';

const LOCAL_STORAGE_KEY = 'swishjam';

export class SwishjamMemory {
  static get(key) {
    if (typeof window === 'undefined') return false;
    return SwishjamMemory._all()[key];
  }

  static set(key, value) {
    if (typeof window === 'undefined') return false;
    const existingMemory = SwishjamMemory._all();
    existingMemory[key] = value;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingMemory));
  }

  static delete(key) {
    if (typeof window === 'undefined') return false;
    const existingMemory = SwishjamMemory._all();
    delete existingMemory[key];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingMemory));
  }

  static _all() {
    if (typeof window === 'undefined') return {};
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
  }
}