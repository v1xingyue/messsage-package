/// Utility functions for message handling
module anonymous_message::message_utils {
    use std::string::{Self, String};
    use std::vector;
    use sui::hash;

    /// Generate a hash for public key
    public fun hash_public_key(public_key: &String): String {
        let key_bytes = string::bytes(public_key);
        let hash_bytes = hash::keccak256(key_bytes);
        string::utf8(hash_bytes)
    }

    /// Validate message hash format
    public fun is_valid_message_hash(message_hash: &String): bool {
        let bytes = string::bytes(message_hash);
        vector::length(bytes) > 0 && vector::length(bytes) <= 1000
    }

    /// Validate public key format
    public fun is_valid_public_key(public_key: &String): bool {
        let bytes = string::bytes(public_key);
        // Basic validation - should be base64 encoded RSA public key
        vector::length(bytes) > 100 && vector::length(bytes) < 2000
    }

    /// Create message preview (first 50 characters)
    public fun create_message_preview(encrypted_content: &String): String {
        let bytes = string::bytes(encrypted_content);
        let preview_length = if (vector::length(bytes) > 50) { 50 } else { vector::length(bytes) };
        
        let preview_bytes = vector::empty<u8>();
        let i = 0;
        while (i < preview_length) {
            vector::push_back(&mut preview_bytes, *vector::borrow(bytes, i));
            i = i + 1;
        };
        
        string::utf8(preview_bytes)
    }
}