export interface KeyPair {
  id: string;
  name: string;
  publicKey: string;
  privateKey: string; // encrypted with master password
  isActive: boolean;
  createdAt: number;
}

export interface PublicKeyEntry {
  id: string;
  name: string;
  publicKey: string;
}

export interface AppState {
  isSetup: boolean;
  masterPasswordHash: string;
  keyPairs: KeyPair[];
  publicKeys: PublicKeyEntry[];
}