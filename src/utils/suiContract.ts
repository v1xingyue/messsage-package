import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

// Contract configuration
export const CONTRACT_CONFIG = {
  PACKAGE_ID: process.env.VITE_SUI_PACKAGE_ID || '0x0', // Will be set after deployment
  MODULE_NAME: 'anonymous_message',
  REGISTRY_OBJECT_ID: process.env.VITE_REGISTRY_OBJECT_ID || '0x0',
  STORAGE_OBJECT_ID: process.env.VITE_STORAGE_OBJECT_ID || '0x0',
};

export interface OnChainPublicKey {
  owner: string;
  publicKey: string;
  name: string;
  createdAt: number;
  isActive: boolean;
}

export interface OnChainMessage {
  sender: string;
  recipientKeyHash: string;
  messageHash: string;
  encryptedContent: string;
  timestamp: number;
  isRead: boolean;
}

export class SuiContractUtils {
  private client: SuiClient;

  constructor(client: SuiClient) {
    this.client = client;
  }

  // Register public key on chain
  async registerPublicKey(
    publicKey: string,
    name: string,
    signer: any
  ): Promise<string> {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::register_public_key`,
      arguments: [
        tx.object(CONTRACT_CONFIG.REGISTRY_OBJECT_ID),
        tx.pure.string(publicKey),
        tx.pure.string(name),
      ],
    });

    const result = await signer.signAndExecuteTransaction({
      transaction: tx,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    return result.digest;
  }

  // Send message on chain
  async sendMessage(
    recipientKeyHash: string,
    messageHash: string,
    encryptedContent: string,
    signer: any
  ): Promise<string> {
    const tx = new Transaction();
    
    // Get user profile object ID (this would need to be tracked)
    const userProfileId = await this.getUserProfileId(signer.getAddress());
    
    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::send_message`,
      arguments: [
        tx.object(CONTRACT_CONFIG.STORAGE_OBJECT_ID),
        tx.object(userProfileId),
        tx.pure.string(recipientKeyHash),
        tx.pure.string(messageHash),
        tx.pure.string(encryptedContent),
      ],
    });

    const result = await signer.signAndExecuteTransaction({
      transaction: tx,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    return result.digest;
  }

  // Mark message as read
  async markMessageRead(
    messageId: string,
    signer: any
  ): Promise<string> {
    const tx = new Transaction();
    
    const userProfileId = await this.getUserProfileId(signer.getAddress());
    
    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::mark_message_read`,
      arguments: [
        tx.object(CONTRACT_CONFIG.STORAGE_OBJECT_ID),
        tx.object(userProfileId),
        tx.pure.string(messageId),
      ],
    });

    const result = await signer.signAndExecuteTransaction({
      transaction: tx,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    return result.digest;
  }

  // Get public key info from chain
  async getPublicKeyInfo(owner: string): Promise<OnChainPublicKey | null> {
    try {
      const result = await this.client.devInspectTransactionBlock({
        transactionBlock: (() => {
          const tx = new Transaction();
          tx.moveCall({
            target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::get_public_key_info`,
            arguments: [
              tx.object(CONTRACT_CONFIG.REGISTRY_OBJECT_ID),
              tx.pure.address(owner),
            ],
          });
          return tx;
        })(),
        sender: owner,
      });

      if (result.results?.[0]?.returnValues) {
        const [publicKey, name, createdAt, isActive] = result.results[0].returnValues;
        return {
          owner,
          publicKey: bcs.string().parse(new Uint8Array(publicKey[0])),
          name: bcs.string().parse(new Uint8Array(name[0])),
          createdAt: Number(bcs.u64().parse(new Uint8Array(createdAt[0]))),
          isActive: bcs.bool().parse(new Uint8Array(isActive[0])),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting public key info:', error);
      return null;
    }
  }

  // Get all registered public keys
  async getAllPublicKeys(): Promise<OnChainPublicKey[]> {
    try {
      // This would require querying events or maintaining an index
      const events = await this.client.queryEvents({
        query: {
          MoveEventType: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::PublicKeyRegistered`,
        },
        limit: 100,
        order: 'descending',
      });

      const publicKeys: OnChainPublicKey[] = [];
      
      for (const event of events.data) {
        if (event.parsedJson) {
          const data = event.parsedJson as any;
          const keyInfo = await this.getPublicKeyInfo(data.owner);
          if (keyInfo && keyInfo.isActive) {
            publicKeys.push(keyInfo);
          }
        }
      }

      return publicKeys;
    } catch (error) {
      console.error('Error getting all public keys:', error);
      return [];
    }
  }

  // Get messages for a user
  async getUserMessages(userAddress: string): Promise<OnChainMessage[]> {
    try {
      const events = await this.client.queryEvents({
        query: {
          MoveEventType: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::MessageSent`,
        },
        limit: 100,
        order: 'descending',
      });

      const messages: OnChainMessage[] = [];
      
      for (const event of events.data) {
        if (event.parsedJson) {
          const data = event.parsedJson as any;
          // Get full message info
          const messageInfo = await this.getMessageInfo(data.message_id);
          if (messageInfo) {
            messages.push(messageInfo);
          }
        }
      }

      return messages.filter(msg => 
        msg.sender === userAddress || 
        this.isMessageForUser(msg, userAddress)
      );
    } catch (error) {
      console.error('Error getting user messages:', error);
      return [];
    }
  }

  // Get message info
  private async getMessageInfo(messageId: string): Promise<OnChainMessage | null> {
    try {
      const result = await this.client.devInspectTransactionBlock({
        transactionBlock: (() => {
          const tx = new Transaction();
          tx.moveCall({
            target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::get_message_info`,
            arguments: [
              tx.object(CONTRACT_CONFIG.STORAGE_OBJECT_ID),
              tx.pure.string(messageId),
            ],
          });
          return tx;
        })(),
        sender: '0x0', // Dummy sender for inspection
      });

      if (result.results?.[0]?.returnValues) {
        const [sender, recipientKeyHash, messageHash, encryptedContent, timestamp, isRead] = result.results[0].returnValues;
        return {
          sender: bcs.address().parse(new Uint8Array(sender[0])),
          recipientKeyHash: bcs.string().parse(new Uint8Array(recipientKeyHash[0])),
          messageHash: bcs.string().parse(new Uint8Array(messageHash[0])),
          encryptedContent: bcs.string().parse(new Uint8Array(encryptedContent[0])),
          timestamp: Number(bcs.u64().parse(new Uint8Array(timestamp[0]))),
          isRead: bcs.bool().parse(new Uint8Array(isRead[0])),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting message info:', error);
      return null;
    }
  }

  // Helper to check if message is for user
  private isMessageForUser(message: OnChainMessage, userAddress: string): boolean {
    // This would require hashing the user's public key and comparing
    // For now, we'll implement a basic check
    return message.recipientKeyHash.includes(userAddress.slice(-8));
  }

  // Get user profile object ID
  private async getUserProfileId(userAddress: string): Promise<string> {
    try {
      const objects = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::UserProfile`,
        },
      });

      if (objects.data.length > 0) {
        return objects.data[0].data?.objectId || '0x0';
      }
      
      throw new Error('User profile not found');
    } catch (error) {
      console.error('Error getting user profile ID:', error);
      throw error;
    }
  }

  // Get contract statistics
  async getContractStats(): Promise<{ totalKeys: number; totalMessages: number }> {
    try {
      const [keysResult, messagesResult] = await Promise.all([
        this.client.devInspectTransactionBlock({
          transactionBlock: (() => {
            const tx = new Transaction();
            tx.moveCall({
              target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::get_registry_stats`,
              arguments: [tx.object(CONTRACT_CONFIG.REGISTRY_OBJECT_ID)],
            });
            return tx;
          })(),
          sender: '0x0',
        }),
        this.client.devInspectTransactionBlock({
          transactionBlock: (() => {
            const tx = new Transaction();
            tx.moveCall({
              target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::get_storage_stats`,
              arguments: [tx.object(CONTRACT_CONFIG.STORAGE_OBJECT_ID)],
            });
            return tx;
          })(),
          sender: '0x0',
        }),
      ]);

      const totalKeys = keysResult.results?.[0]?.returnValues?.[0] 
        ? Number(bcs.u64().parse(new Uint8Array(keysResult.results[0].returnValues[0][0])))
        : 0;

      const totalMessages = messagesResult.results?.[0]?.returnValues?.[0]
        ? Number(bcs.u64().parse(new Uint8Array(messagesResult.results[0].returnValues[0][0])))
        : 0;

      return { totalKeys, totalMessages };
    } catch (error) {
      console.error('Error getting contract stats:', error);
      return { totalKeys: 0, totalMessages: 0 };
    }
  }

  // Update public key status
  async updateKeyStatus(isActive: boolean, signer: any): Promise<string> {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${CONTRACT_CONFIG.PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::update_key_status`,
      arguments: [
        tx.object(CONTRACT_CONFIG.REGISTRY_OBJECT_ID),
        tx.pure.bool(isActive),
      ],
    });

    const result = await signer.signAndExecuteTransaction({
      transaction: tx,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    return result.digest;
  }
}