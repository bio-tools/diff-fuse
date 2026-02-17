"""
Array element alignment utilities.

This package contains the low-level algorithms used to align elements
across arrays from multiple documents. The diff engine relies on these
strategies to determine which elements should be compared against each
other.

Conceptual model
----------------
Given N documents containing arrays at the same path, the array match
layer produces **alignment groups**. Each group represents elements that
should be considered the "same logical item" across documents.

These groups are later expanded into DiffNode children.
"""
