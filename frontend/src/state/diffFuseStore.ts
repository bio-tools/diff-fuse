// ./state/diffFuseStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ArrayStrategy, MergeSelection } from '../api/generated';
import { MergeSelection as MergeSelectionEnum } from '../api/generated';
import { parentPaths } from '../utils/selectionPath';

const MAX_SESSIONS = 15;

const touch = (per: PerSession): PerSession => ({
    ...per,
    lastUsedAt: Date.now(),
});

type PerSession = {
    arrayStrategies: Record<string, ArrayStrategy>;
    selectionsByNodeId: Record<string, MergeSelection>;
    childrenByPath: Record<string, string[]>;
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
    setChildrenByPath: (sessionId: string, index: Record<string, string[]>) => void;

    // selections (smart)
    selectDocSmart: (sessionId: string, nodeId: string, docId: string) => void;
    selectManualSmart: (sessionId: string, nodeId: string, value: any) => void;
};

function empty(): PerSession {
    return { arrayStrategies: {}, selectionsByNodeId: {}, childrenByPath: {}, lastUsedAt: Date.now() };
}

export const useDiffFuseStore = create<DiffFuseState>()(
    persist(
        (set, get) => {

            const setSelectionSmart = (sessionId: string, nodeId: string, nextSel: MergeSelection) => {
                get().ensure(sessionId);

                set((s) => {
                    const curSession = s.bySessionId[sessionId];
                    const selections = { ...curSession.selectionsByNodeId };
                    const childrenByPath = curSession.childrenByPath ?? {};

                    // Keep breaking inheritance until nothing above `path` is selected anymore.
                    while (true) {
                        const anc = nearestAncestorWithSelection(selections, nodeId);
                        if (!anc) break;

                        const ancSel = selections[anc];
                        const children = childrenByPath[anc] ?? [];

                        // Materialize ancestor selection onto ALL direct children (if not already set)
                        for (const childPath of children) {
                            if (selections[childPath] === undefined) {
                                selections[childPath] = ancSel;
                            }
                        }

                        // Remove ancestor so it no longer covers the subtree
                        delete selections[anc];
                    }

                    // Apply clicked selection (overrides anything materialized)
                    selections[nodeId] = nextSel;

                    return {
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: touch({
                                ...curSession,
                                selectionsByNodeId: selections,
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
                                arrayStrategies: {
                                    ...s.bySessionId[sessionId].arrayStrategies,
                                    [nodeId]: strategy,
                                },
                            }),
                        },
                    }));
                },

                clearArrayStrategy: (sessionId, nodeId) => {
                    get().ensure(sessionId);
                    set((s) => {
                        const next = { ...s.bySessionId[sessionId].arrayStrategies };
                        delete next[nodeId];
                        return {
                            bySessionId: {
                                ...s.bySessionId,
                                [sessionId]: touch({ ...s.bySessionId[sessionId], arrayStrategies: next }),
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
                                    [nodeId]: { kind: MergeSelectionEnum.kind.DOC, doc_id: docId },
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
                                    [nodeId]: { kind: MergeSelectionEnum.kind.MANUAL, manual_value: value },
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
                        const cur = s.bySessionId[sessionId].selectionsByNodeId;
                        const next: typeof cur = {};

                        for (const k of Object.keys(cur)) {
                            if (k === nodeId) continue; // we'll overwrite it anyway
                            if (isDescendantPath(k, nodeId)) continue; // delete descendants
                            next[k] = cur[k];
                        }

                        return {
                            bySessionId: {
                                ...s.bySessionId,
                                [sessionId]: touch({
                                    ...s.bySessionId[sessionId],
                                    selectionsByNodeId: next,
                                }),
                            },
                        };
                    });
                },

                setChildrenByPath: (sessionId, index) => {
                    get().ensure(sessionId);
                    set((s) => ({
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: touch({
                                ...s.bySessionId[sessionId],
                                childrenByPath: index,
                            }),
                        },
                    }));
                },

                selectDocSmart: (sessionId, nodeId, docId) => {
                    setSelectionSmart(sessionId, nodeId, {
                        kind: MergeSelectionEnum.kind.DOC,
                        doc_id: docId,
                    });
                },

                selectManualSmart: (sessionId, nodeId, value) => {
                    setSelectionSmart(sessionId, nodeId, {
                        kind: MergeSelectionEnum.kind.MANUAL,
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
                            arrayStrategies: per.arrayStrategies,
                            selectionsByNodeId: per.selectionsByNodeId,
                            lastUsedAt: per.lastUsedAt,
                            childrenByPath: {}, // drop derived data
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


function isDescendantPath(candidate: string, ancestor: string): boolean {
    if (ancestor === '') return candidate !== ''; // everything except root is descendant of root
    if (candidate === ancestor) return false;

    if (!candidate.startsWith(ancestor)) return false;

    const nextChar = candidate.charAt(ancestor.length);
    // descendant boundary must be '.' or '['
    return nextChar === '.' || nextChar === '[';
}

function nearestAncestorWithSelection(
    selections: Record<string, MergeSelection>,
    nodeId: string
): string | null {
    // parentPaths returns [path, parent, grandparent, ..., ""]
    const ps = parentPaths(nodeId).slice(1); // skip self
    for (const p of ps) {
        if (selections[p] !== undefined) return p;
    }
    return null;
}

function pruneSessions(bySessionId: Record<string, PerSession>): Record<string, PerSession> {
    const entries = Object.entries(bySessionId);

    if (entries.length <= MAX_SESSIONS) return bySessionId;

    // newest first
    entries.sort((a, b) => (b[1].lastUsedAt ?? 0) - (a[1].lastUsedAt ?? 0));

    const keep = entries.slice(0, MAX_SESSIONS);
    return Object.fromEntries(keep);
}