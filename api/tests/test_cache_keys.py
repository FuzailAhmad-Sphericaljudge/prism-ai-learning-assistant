import pytest
from api.context.cache import generate_temporal_cache_key
from api.firewall.types import FirewallMode


def test_cache_keys_user_and_auth_isolation():
    k1 = generate_temporal_cache_key(user_id="user-1", course_id="c1", query="BST property", playback_sec=100.0)
    k2 = generate_temporal_cache_key(user_id="user-2", course_id="c1", query="BST property", playback_sec=100.0)
    k3 = generate_temporal_cache_key(user_id="user-1", course_id="c1", query="BST property", playback_sec=100.0, auth_token_or_role="educator")

    assert k1 != k2
    assert k1 != k3


def test_cache_keys_temporal_scope_isolation():
    # Playback at 100s vs 500s must have distinct keys in learn_so_far
    k_100 = generate_temporal_cache_key(user_id="user-1", course_id="c1", query="BST", playback_sec=100.0, mode=FirewallMode.LEARN_SO_FAR)
    k_500 = generate_temporal_cache_key(user_id="user-1", course_id="c1", query="BST", playback_sec=500.0, mode=FirewallMode.LEARN_SO_FAR)

    assert k_100 != k_500


def test_cache_keys_quantization_stability():
    # Playback at 101.2s and 103.8s fall in the same [100, 105) 5s bin
    k_a = generate_temporal_cache_key(user_id="user-1", course_id="c1", query="BST query", playback_sec=101.2)
    k_b = generate_temporal_cache_key(user_id="user-1", course_id="c1", query="BST query", playback_sec=103.8)

    assert k_a == k_b


def test_cache_keys_mode_isolation():
    k_learn = generate_temporal_cache_key(user_id="user-1", course_id="c1", query="BST", playback_sec=100.0, mode=FirewallMode.LEARN_SO_FAR)
    k_explore = generate_temporal_cache_key(user_id="user-1", course_id="c1", query="BST", playback_sec=100.0, mode=FirewallMode.EXPLORE_AHEAD)

    assert k_learn != k_explore
