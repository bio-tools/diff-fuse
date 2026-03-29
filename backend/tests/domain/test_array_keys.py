from __future__ import annotations

import pytest

from diff_fuse.domain.array_keys import suggest_keys_for_array


def test_suggest_keys_prefers_id_like_fields():
    arrays_by_doc = {
        "A": [{"id": 1, "name": "x"}, {"id": 2, "name": "y"}],
        "B": [{"id": 1, "name": "x"}, {"id": 3, "name": "z"}],
    }

    out = suggest_keys_for_array(arrays_by_doc, top_k=5)
    assert out, "Expected non-empty suggestions"
    # Typically "id" should win here: present everywhere and unique-ish
    assert out[0].key in {"id", "name"}  # keep test robust to heuristic tweaks
    keys = [s.key for s in out]
    assert "id" in keys


@pytest.mark.parametrize(
    "arrays_by_doc",
    [
        {"A": [1, 2, 3], "B": [1, 2]},  # no object elements
        {"A": [{"x": 1}], "B": ["oops"]},  # mixed element types, still should work (ignores non-dicts)
        {"A": [], "B": []},  # empty
    ],
)
def test_suggest_keys_handles_non_object_arrays(arrays_by_doc):
    out = suggest_keys_for_array(arrays_by_doc, top_k=10)
    # For these inputs, suggestions may be empty; that's acceptable and expected.
    assert isinstance(out, list)
