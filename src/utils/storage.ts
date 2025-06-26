import { AppState, KeyPair, PublicKeyEntry } from '../types';

const STORAGE_KEY = 'anonymous-message-tool-data';

export class StorageUtils {
  static loadAppState(): AppState {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        isSetup: false,
        masterPasswordHash: '',
        keyPairs: [],
        publicKeys: [],
      };
    }

    try {
      return JSON.parse(stored);
    } catch {
      return {
        isSetup: false,
        masterPasswordHash: '',
        keyPairs: [],
        publicKeys: [],
      };
    }
  }

  static saveAppState(state: AppState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  static clearAppState(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}