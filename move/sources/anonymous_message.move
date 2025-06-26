/// Anonymous Message Transmission Contract
/// This contract allows users to register public keys and store encrypted message hashes
module anonymous_message::anonymous_message {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};
    use std::vector;

    /// Error codes
    const EPublicKeyAlreadyExists: u64 = 1;
    const EPublicKeyNotFound: u64 = 2;
    const EInvalidMessageHash: u64 = 3;
    const ENotAuthorized: u64 = 4;

    /// Public Key Registry - stores all registered public keys
    struct PublicKeyRegistry has key {
        id: UID,
        keys: Table<address, PublicKeyInfo>,
        total_keys: u64,
    }

    /// Public Key Information
    struct PublicKeyInfo has store {
        owner: address,
        public_key: String,
        name: String,
        created_at: u64,
        is_active: bool,
    }

    /// Message Storage - stores encrypted message hashes
    struct MessageStorage has key {
        id: UID,
        messages: Table<String, MessageInfo>,
        total_messages: u64,
    }

    /// Message Information
    struct MessageInfo has store {
        sender: address,
        recipient_key_hash: String,
        message_hash: String,
        encrypted_content: String,
        timestamp: u64,
        is_read: bool,
    }

    /// User Profile - tracks user's keys and messages
    struct UserProfile has key {
        id: UID,
        owner: address,
        public_keys: vector<String>,
        sent_messages: vector<String>,
        received_messages: vector<String>,
    }

    /// Events
    struct PublicKeyRegistered has copy, drop {
        owner: address,
        public_key: String,
        name: String,
        timestamp: u64,
    }

    struct MessageSent has copy, drop {
        sender: address,
        recipient_key_hash: String,
        message_id: String,
        timestamp: u64,
    }

    struct MessageRead has copy, drop {
        reader: address,
        message_id: String,
        timestamp: u64,
    }

    /// Initialize the contract
    fun init(ctx: &mut TxContext) {
        let registry = PublicKeyRegistry {
            id: object::new(ctx),
            keys: table::new(ctx),
            total_keys: 0,
        };

        let storage = MessageStorage {
            id: object::new(ctx),
            messages: table::new(ctx),
            total_messages: 0,
        };

        transfer::share_object(registry);
        transfer::share_object(storage);
    }

    /// Register a public key
    public entry fun register_public_key(
        registry: &mut PublicKeyRegistry,
        public_key: String,
        name: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check if user already has a key registered
        assert!(!table::contains(&registry.keys, sender), EPublicKeyAlreadyExists);

        let key_info = PublicKeyInfo {
            owner: sender,
            public_key,
            name,
            created_at: tx_context::epoch_timestamp_ms(ctx),
            is_active: true,
        };

        table::add(&mut registry.keys, sender, key_info);
        registry.total_keys = registry.total_keys + 1;

        // Create user profile if it doesn't exist
        let profile = UserProfile {
            id: object::new(ctx),
            owner: sender,
            public_keys: vector::empty(),
            sent_messages: vector::empty(),
            received_messages: vector::empty(),
        };

        vector::push_back(&mut profile.public_keys, public_key);
        transfer::transfer(profile, sender);

        // Emit event
        event::emit(PublicKeyRegistered {
            owner: sender,
            public_key,
            name,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Update public key status
    public entry fun update_key_status(
        registry: &mut PublicKeyRegistry,
        is_active: bool,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(table::contains(&registry.keys, sender), EPublicKeyNotFound);

        let key_info = table::borrow_mut(&mut registry.keys, sender);
        assert!(key_info.owner == sender, ENotAuthorized);
        
        key_info.is_active = is_active;
    }

    /// Send an encrypted message
    public entry fun send_message(
        storage: &mut MessageStorage,
        profile: &mut UserProfile,
        recipient_key_hash: String,
        message_hash: String,
        encrypted_content: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(profile.owner == sender, ENotAuthorized);

        let message_id = generate_message_id(&message_hash, ctx);
        
        let message_info = MessageInfo {
            sender,
            recipient_key_hash,
            message_hash,
            encrypted_content,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
            is_read: false,
        };

        table::add(&mut storage.messages, message_id, message_info);
        storage.total_messages = storage.total_messages + 1;

        // Update user profile
        vector::push_back(&mut profile.sent_messages, message_id);

        // Emit event
        event::emit(MessageSent {
            sender,
            recipient_key_hash,
            message_id,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Mark message as read
    public entry fun mark_message_read(
        storage: &mut MessageStorage,
        profile: &mut UserProfile,
        message_id: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(profile.owner == sender, ENotAuthorized);
        assert!(table::contains(&storage.messages, message_id), EInvalidMessageHash);

        let message_info = table::borrow_mut(&mut storage.messages, message_id);
        message_info.is_read = true;

        // Add to received messages if not already there
        if (!vector::contains(&profile.received_messages, &message_id)) {
            vector::push_back(&mut profile.received_messages, message_id);
        };

        // Emit event
        event::emit(MessageRead {
            reader: sender,
            message_id,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    /// Get public key info
    public fun get_public_key_info(
        registry: &PublicKeyRegistry,
        owner: address
    ): (String, String, u64, bool) {
        assert!(table::contains(&registry.keys, owner), EPublicKeyNotFound);
        let key_info = table::borrow(&registry.keys, owner);
        (key_info.public_key, key_info.name, key_info.created_at, key_info.is_active)
    }

    /// Get message info
    public fun get_message_info(
        storage: &MessageStorage,
        message_id: String
    ): (address, String, String, String, u64, bool) {
        assert!(table::contains(&storage.messages, message_id), EInvalidMessageHash);
        let message_info = table::borrow(&storage.messages, message_id);
        (
            message_info.sender,
            message_info.recipient_key_hash,
            message_info.message_hash,
            message_info.encrypted_content,
            message_info.timestamp,
            message_info.is_read
        )
    }

    /// Get registry stats
    public fun get_registry_stats(registry: &PublicKeyRegistry): u64 {
        registry.total_keys
    }

    /// Get storage stats
    public fun get_storage_stats(storage: &MessageStorage): u64 {
        storage.total_messages
    }

    /// Helper function to generate message ID
    fun generate_message_id(message_hash: &String, ctx: &mut TxContext): String {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        
        // Create a unique ID by combining sender, timestamp, and message hash
        let id_bytes = vector::empty<u8>();
        vector::append(&mut id_bytes, sui::address::to_bytes(sender));
        vector::append(&mut id_bytes, sui::bcs::to_bytes(&timestamp));
        vector::append(&mut id_bytes, *string::bytes(message_hash));
        
        string::utf8(sui::hash::keccak256(&id_bytes))
    }

    /// Check if user has registered public key
    public fun has_public_key(registry: &PublicKeyRegistry, owner: address): bool {
        table::contains(&registry.keys, owner)
    }

    /// Get user's message count
    public fun get_user_message_counts(profile: &UserProfile): (u64, u64) {
        (vector::length(&profile.sent_messages), vector::length(&profile.received_messages))
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}