// Crypto utilities using Web Crypto API
export class CryptoUtils {
  // Generate RSA key pair
  static async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );

    const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: this.arrayBufferToBase64(publicKey),
      privateKey: this.arrayBufferToBase64(privateKey),
    };
  }

  // Encrypt message with public key
  static async encryptMessage(message: string, publicKeyPem: string): Promise<string> {
    const publicKey = await this.importPublicKey(publicKeyPem);
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      data
    );

    return this.arrayBufferToBase64(encrypted);
  }

  // Decrypt message with private key
  static async decryptMessage(encryptedMessage: string, privateKeyPem: string): Promise<string> {
    const privateKey = await this.importPrivateKey(privateKeyPem);
    const encrypted = this.base64ToArrayBuffer(encryptedMessage);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Encrypt private key with master password
  static async encryptPrivateKey(privateKey: string, masterPassword: string): Promise<string> {
    const key = await this.deriveKey(masterPassword);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const data = encoder.encode(privateKey);

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return this.arrayBufferToBase64(combined);
  }

  // Decrypt private key with master password
  static async decryptPrivateKey(encryptedPrivateKey: string, masterPassword: string): Promise<string> {
    const key = await this.deriveKey(masterPassword);
    const combined = this.base64ToArrayBuffer(encryptedPrivateKey);
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Hash master password
  static async hashMasterPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return this.arrayBufferToBase64(hash);
  }

  // Helper methods
  private static async deriveKey(password: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('anonymous-message-tool-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private static async importPublicKey(publicKeyPem: string): Promise<CryptoKey> {
    const publicKeyBuffer = this.base64ToArrayBuffer(publicKeyPem);
    return await window.crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    );
  }

  private static async importPrivateKey(privateKeyPem: string): Promise<CryptoKey> {
    const privateKeyBuffer = this.base64ToArrayBuffer(privateKeyPem);
    return await window.crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['decrypt']
    );
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}