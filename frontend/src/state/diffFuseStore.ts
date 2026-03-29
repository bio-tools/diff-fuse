/**
 * Session-scoped diff/merge UI state.
 *
 * This store keeps frontend-only state keyed by backend `sessionId`.
 *
 * Stored per session
 * ------------------
 * - array strategies by backend `node_id`
 * - merge selections by backend `node_id`
 * - a node index derived from the latest diff tree
 *
 * Persistence policy
 * ------------------
 * - Persisted:
 *   - arrayStrategiesByNodeId
 *   - selectionsByNodeId
 *   - lastUsedAt
 * - Not persisted:
 *   - nodeIndex
 *
 * Notes
 * -----
 * - `nodeIndex` is derived from the current diff tree and is rebuilt after diff fetches.
 * - Selections are keyed by stable backend `node_id`, never by display path.
 * - Persisted session state is pruned to the most recently used sessions.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ArrayStrategy } from "../api/generated";
import type { MergeSelection } from "../utils/mergeSelection";
import type { NodeIndex } from "../utils/nodeIndex";
import { ancestorNodeIds, isDescendantNodeId } from "../utils/nodeIndex";

const MAX_SESSIONS = 15;

const touch = (per: PerSession): PerSession => ({
    ...per,
    lastUsedAt: Date.now(),
});

/**
 * Frontend state stored for one backend session.
 */
type PerSession = {
    arrayStrategiesByNodeId: Record<string, ArrayStrategy>;
    selectionsByNodeId: Record<string, MergeSelection>;
    nodeIndex: NodeIndex;
    lastUsedAt: number;
};

/**
 * Zustand store contract for session-scoped diff/merge UI state.
 */
type DiffFuseState = {
    bySessionId: Record<string, PerSession>;

    // helpers
    ensure: (sessionId: string) => void;

    // array strategies
    setArrayStrategy: (sessionId: string, nodeId: string, strategy: ArrayStrategy) => void;
    clearArrayStrategy: (sessionId: string, nodeId: string) => void;

    // selections (basic)
    selectDoc: (sessionId: string, nodeId: string, docId: string) => void;
    selectManual: (sessionId: string, nodeId: string, value: any) => void;
    clearSelection: (sessionId: string, nodeId: string) => void;
    clearAllSelections: (sessionId: string) => void;

    // selections (helpers)
    clearSelectionsUnder: (sessionId: string, nodeId: string) => void;
    setNodeIndex: (sessionId: string, index: NodeIndex) => void;

    // selections (smart)
    selectDocSmart: (sessionId: string, nodeId: string, docId: string) => void;
    selectManualSmart: (sessionId: string, nodeId: string, value: any) => void;
};

/**
 * Create the initial per-session state.
 */
function empty(): PerSession {
    return {
        arrayStrategiesByNodeId: {},
        selectionsByNodeId: {},
        nodeIndex: {},
        lastUsedAt: Date.now(),
    };
}

/**
 * Main store for diff-fuse UI state.
 *
 * This store is intentionally separate from React Query cache:
 * - React Query owns server data
 * - Zustand owns local UI decisions and persisted user choices
 */
export const useDiffFuseStore = create<DiffFuseState>()(
    persist(
        (set, get) => {
            /**
             * Apply a selection while preserving subtree override semantics.
             *
             * If an ancestor already has a selection, that ancestor selection is pushed
             * one level down to its direct children before the new selection is written
             * at `nodeId`.
             *
             * Why this exists
             * ---------------
             * A single ancestor selection implicitly applies to the whole subtree.
             * If the user later picks a more specific node, we cannot keep the broad
             * ancestor selection as-is because it would continue to shadow the subtree.
             *
             * Instead, we materialize the ancestor selection on its children, remove the
             * ancestor selection, and then write the new specific selection.
             */
            const setSelectionSmart = (sessionId: string, nodeId: string, nextSel: MergeSelection) => {
                get().ensure(sessionId);

                set((s) => {
                    const curSession = s.bySessionId[sessionId];
                    const selectionsByNodeId = { ...curSession.selectionsByNodeId };
                    const nodeIndex = curSession.nodeIndex ?? {};

                    while (true) {
                        // Find the nearest selected ancestor that still implicitly covers `nodeId`.
                        const anc = nearestAncestorWithSelection(selectionsByNodeId, nodeIndex, nodeId);
                        if (!anc) break;

                        const ancSel = selectionsByNodeId[anc];
                        const childIds = nodeIndex[anc]?.childIds ?? [];

                        // Materialize the ancestor selection one level lower so siblings keep the
                        // previous effective choice after we remove the broad ancestor selection.
                        for (const childId of childIds) {
                            if (selectionsByNodeId[childId] === undefined) {
                                selectionsByNodeId[childId] = ancSel;
                            }
                        }

                        // Remove the broad ancestor selection before writing the more specific one.
                        delete selectionsByNodeId[anc];
                    }

                    selectionsByNodeId[nodeId] = nextSel;

                    return {
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: touch({
                                ...curSession,
                                selectionsByNodeId,
                            }),
                        },
                    };
                });
            };

            return {
                bySessionId: {},

                ensure: (sessionId) => {
                    const cur = get().bySessionId[sessionId];
                    if (cur) return;

                    set((s) => ({ bySessionId: pruneSessions({ ...s.bySessionId, [sessionId]: empty() }) }));
                },

                setArrayStrategy: (sessionId, nodeId, strategy) => {
                    get().ensure(sessionId);
                    set((s) => ({
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: touch({
                                ...s.bySessionId[sessionId],
                                arrayStrategiesByNodeId: {
                                    ...s.bySessionId[sessionId].arrayStrategiesByNodeId,
                                    [nodeId]: strategy,
                                },
                            }),
                        },
                    }));
                },

                clearArrayStrategy: (sessionId, nodeId) => {
                    get().ensure(sessionId);
                    set((s) => {
                        const next = { ...s.bySessionId[sessionId].arrayStrategiesByNodeId };
                        delete next[nodeId];
                        return {
                            bySessionId: {
                                ...s.bySessionId,
                                [sessionId]: touch({ ...s.bySessionId[sessionId], arrayStrategiesByNodeId: next }),
                            },
                        };
                    });
                },

                selectDoc: (sessionId, nodeId, docId) => {
                    get().ensure(sessionId);
                    set((s) => ({
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: touch({
                                ...s.bySessionId[sessionId],
                                selectionsByNodeId: {
                                    ...s.bySessionId[sessionId].selectionsByNodeId,
                                    [nodeId]: { kind: "doc", doc_id: docId },
                                },
                            }),
                        },
                    }));
                },

                selectManual: (sessionId, nodeId, value) => {
                    get().ensure(sessionId);
                    set((s) => ({
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: touch({
                                ...s.bySessionId[sessionId],
                                selectionsByNodeId: {
                                    ...s.bySessionId[sessionId].selectionsByNodeId,
                                    [nodeId]: { kind: "manual", manual_value: value },
                                },
                            }),
                        },
                    }));
                },

                clearSelection: (sessionId, nodeId) => {
                    get().ensure(sessionId);
                    set((s) => {
                        const next = { ...s.bySessionId[sessionId].selectionsByNodeId };
                        delete next[nodeId];
                        return {
                            bySessionId: {
                                ...s.bySessionId,
                                [sessionId]: touch({ ...s.bySessionId[sessionId], selectionsByNodeId: next }),
                            },
                        };
                    });
                },

                clearAllSelections: (sessionId) => {
                    get().ensure(sessionId);
                    set((s) => ({
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: touch({ ...s.bySessionId[sessionId], selectionsByNodeId: {} }),
                        },
                    }));
                },

                clearSelectionsUnder: (sessionId, nodeId) => {
                    get().ensure(sessionId);
                    set((s) => {
                        const curSession = s.bySessionId[sessionId];
                        const cur = curSession.selectionsByNodeId;
                        const index = curSession.nodeIndex ?? {};
                        const next: typeof cur = {};

                        for (const k of Object.keys(cur)) {
                            if (k === nodeId) continue;
                            if (isDescendantNodeId(index, k, nodeId)) continue;
                            next[k] = cur[k];
                        }

                        return {
                            bySessionId: {
                                ...s.bySessionId,
                                [sessionId]: touch({
                                    ...curSession,
                                    selectionsByNodeId: next,
                                }),
                            },
                        };
                    });
                },

                setNodeIndex: (sessionId, index) => {
                    get().ensure(sessionId);
                    set((s) => ({
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: touch({
                                ...s.bySessionId[sessionId],
                                nodeIndex: index,
                            }),
                        },
                    }));
                },

                selectDocSmart: (sessionId, nodeId, docId) => {
                    setSelectionSmart(sessionId, nodeId, {
                        kind: "doc",
                        doc_id: docId,
                    });
                },

                selectManualSmart: (sessionId, nodeId, value) => {
                    setSelectionSmart(sessionId, nodeId, {
                        kind: "manual",
                        manual_value: value,
                    });
                },
            };
        },
        {
            name: "diff-fuse-ui",
            partialize: (s) => ({
                bySessionId: Object.fromEntries(
                    Object.entries(s.bySessionId).map(([sid, per]) => [
                        sid,
                        {
                            arrayStrategiesByNodeId: per.arrayStrategiesByNodeId,
                            selectionsByNodeId: per.selectionsByNodeId,
                            lastUsedAt: per.lastUsedAt,
                            nodeIndex: {}, // derived from diff result; intentionally not persisted
                        } satisfies PerSession,
                    ])
                ),
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return;
                // prune immediately after load
                state.bySessionId = pruneSessions(state.bySessionId);
            },
        }
    )
);

/**
 * Find the nearest ancestor of `nodeId` that has an explicit selection.
 *
 * The node itself is excluded. Returns `null` when no selected ancestor exists.
 */
const nearestAncestorWithSelection = (
    selectionsByNodeId: Record<string, MergeSelection>,
    index: NodeIndex,
    nodeId: string
): string | null => {
    const ids = ancestorNodeIds(index, nodeId).slice(1); // skip self
    for (const id of ids) {
        if (selectionsByNodeId[id] !== undefined) return id;
    }
    return null;
};

/**
 * Keep only the most recently used persisted sessions.
 *
 * This bounds local storage growth when many sessions are opened over time.
 */
function pruneSessions(bySessionId: Record<string, PerSession>): Record<string, PerSession> {
    const entries = Object.entries(bySessionId);

    if (entries.length <= MAX_SESSIONS) return bySessionId;

    // newest first
    entries.sort((a, b) => (b[1].lastUsedAt ?? 0) - (a[1].lastUsedAt ?? 0));

    const keep = entries.slice(0, MAX_SESSIONS);
    return Object.fromEntries(keep);
}
