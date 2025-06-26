#[test_only]
module anonymous_message::anonymous_message_tests {
    use anonymous_message::anonymous_message::{Self, PublicKeyRegistry, MessageStorage, UserProfile};
    use sui::test_scenario::{Self, Scenario};
    use std::string;

    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;

    #[test]
    fun test_register_public_key() {
        let scenario = test_scenario::begin(ADMIN);
        {
            anonymous_message::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, USER1);
        {
            let registry = test_scenario::take_shared<PublicKeyRegistry>(&scenario);
            
            anonymous_message::register_public_key(
                &mut registry,
                string::utf8(b"test_public_key_123"),
                string::utf8(b"User1 Key"),
                test_scenario::ctx(&mut scenario)
            );

            assert!(anonymous_message::has_public_key(&registry, USER1), 0);
            assert!(anonymous_message::get_registry_stats(&registry) == 1, 1);

            test_scenario::return_shared(registry);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_send_and_read_message() {
        let scenario = test_scenario::begin(ADMIN);
        {
            anonymous_message::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        // Register public keys for both users
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let registry = test_scenario::take_shared<PublicKeyRegistry>(&scenario);
            
            anonymous_message::register_public_key(
                &mut registry,
                string::utf8(b"user1_public_key"),
                string::utf8(b"User1"),
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(registry);
        };

        test_scenario::next_tx(&mut scenario, USER2);
        {
            let registry = test_scenario::take_shared<PublicKeyRegistry>(&scenario);
            
            anonymous_message::register_public_key(
                &mut registry,
                string::utf8(b"user2_public_key"),
                string::utf8(b"User2"),
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(registry);
        };

        // Send message from USER1 to USER2
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let storage = test_scenario::take_shared<MessageStorage>(&scenario);
            let profile = test_scenario::take_from_sender<UserProfile>(&scenario);
            
            anonymous_message::send_message(
                &mut storage,
                &mut profile,
                string::utf8(b"user2_key_hash"),
                string::utf8(b"message_hash_123"),
                string::utf8(b"encrypted_message_content"),
                test_scenario::ctx(&mut scenario)
            );

            let (sent_count, _) = anonymous_message::get_user_message_counts(&profile);
            assert!(sent_count == 1, 2);

            test_scenario::return_shared(storage);
            test_scenario::return_to_sender(&scenario, profile);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = anonymous_message::anonymous_message::EPublicKeyAlreadyExists)]
    fun test_duplicate_public_key_registration() {
        let scenario = test_scenario::begin(ADMIN);
        {
            anonymous_message::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, USER1);
        {
            let registry = test_scenario::take_shared<PublicKeyRegistry>(&scenario);
            
            // First registration should succeed
            anonymous_message::register_public_key(
                &mut registry,
                string::utf8(b"test_key"),
                string::utf8(b"Test"),
                test_scenario::ctx(&mut scenario)
            );

            // Second registration should fail
            anonymous_message::register_public_key(
                &mut registry,
                string::utf8(b"another_key"),
                string::utf8(b"Another"),
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(registry);
        };

        test_scenario::end(scenario);
    }
}