import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ArrayStrategy } from "../api/generated";
import type { NodeIndex } from "../utils/nodeIndex";
import { ancestorNodeIds, isDescendantNodeId } from "../utils/nodeIndex";
import type { MergeSelection } from "../utils/mergeSelection";

const MAX_SESSIONS = 15;

const touch = (per: PerSession): PerSession => ({
    ...per,
    lastUsedAt: Date.now(),
});

type PerSession = {
    arrayStrategiesByNodeId: Record<string, ArrayStrategy>;
    selectionsByNodeId: Record<string, MergeSelection>;
    nodeIndex: NodeIndex;
    lastUsedAt: number;
};

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

function empty(): PerSession {
    return {
        arrayStrategiesByNodeId: {},
        selectionsByNodeId: {},
        nodeIndex: {},
        lastUsedAt: Date.now(),
    };
}

export const useDiffFuseStore = create<DiffFuseState>()(
    persist(
        (set, get) => {

            const setSelectionSmart = (sessionId: string, nodeId: string, nextSel: MergeSelection) => {
                get().ensure(sessionId);

                set((s) => {
                    const curSession = s.bySessionId[sessionId];
                    const selectionsByNodeId = { ...curSession.selectionsByNodeId };
                    const nodeIndex = curSession.nodeIndex ?? {};

                    while (true) {
                        const anc = nearestAncestorWithSelection(selectionsByNodeId, nodeIndex, nodeId);
                        if (!anc) break;

                        const ancSel = selectionsByNodeId[anc];
                        const childIds = nodeIndex[anc]?.childIds ?? [];

                        for (const childId of childIds) {
                            if (selectionsByNodeId[childId] === undefined) {
                                selectionsByNodeId[childId] = ancSel;
                            }
                        }

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
            name: 'diff-fuse-ui',
            // partialize: (s) => ({ bySessionId: s.bySessionId }),
            partialize: (s) => ({
                bySessionId: Object.fromEntries(
                    Object.entries(s.bySessionId).map(([sid, per]) => [
                        sid,
                        {
                            arrayStrategiesByNodeId: per.arrayStrategiesByNodeId,
                            selectionsByNodeId: per.selectionsByNodeId,
                            lastUsedAt: per.lastUsedAt,
                            nodeIndex: {}, // derived, do not persist
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

function pruneSessions(bySessionId: Record<string, PerSession>): Record<string, PerSession> {
    const entries = Object.entries(bySessionId);

    if (entries.length <= MAX_SESSIONS) return bySessionId;

    // newest first
    entries.sort((a, b) => (b[1].lastUsedAt ?? 0) - (a[1].lastUsedAt ?? 0));

    const keep = entries.slice(0, MAX_SESSIONS);
    return Object.fromEntries(keep);
}