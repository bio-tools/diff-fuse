// ./state/diffFuseStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ArrayStrategy, MergeSelection } from '../api/generated';
import { MergeSelection as MergeSelectionEnum } from '../api/generated';
import { parentPaths } from '../utils/selectionPath';

const MAX_SESSIONS = 15;

type PerSession = {
    arrayStrategies: Record<string, ArrayStrategy>;
    selections: Record<string, MergeSelection>;
    childrenByPath: Record<string, string[]>;
    lastUsedAt: number;
};

type DiffFuseState = {
    bySessionId: Record<string, PerSession>;

    // helpers
    ensure: (sessionId: string) => void;

    // array strategies
    setArrayStrategy: (sessionId: string, path: string, strategy: ArrayStrategy) => void;
    clearArrayStrategy: (sessionId: string, path: string) => void;

    // selections (basic)
    selectDoc: (sessionId: string, path: string, docId: string) => void;
    selectManual: (sessionId: string, path: string, value: any) => void;
    clearSelection: (sessionId: string, path: string) => void;
    clearAllSelections: (sessionId: string) => void;

    // selections (helpers)
    clearSelectionsUnder: (sessionId: string, path: string) => void;
    setChildrenByPath: (sessionId: string, index: Record<string, string[]>) => void;

    // selections (smart)
    selectDocSmart: (sessionId: string, path: string, docId: string) => void;
    selectManualSmart: (sessionId: string, path: string, value: any) => void;
};

function empty(): PerSession {
    return { arrayStrategies: {}, selections: {}, childrenByPath: {}, lastUsedAt: Date.now() };
}

export const useDiffFuseStore = create<DiffFuseState>()(
    persist(
        (set, get) => {

            const setSelectionSmart = (sessionId: string, path: string, nextSel: MergeSelection) => {
                get().ensure(sessionId);

                set((s) => {
                    const curSession = s.bySessionId[sessionId];
                    const selections = { ...curSession.selections };
                    const childrenByPath = curSession.childrenByPath ?? {};

                    // Keep breaking inheritance until nothing above `path` is selected anymore.
                    while (true) {
                        const anc = nearestAncestorWithSelection(selections, path);
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
                    selections[path] = nextSel;

                    return {
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: {
                                ...curSession,
                                selections,
                            },
                        },
                    };
                });
            };

            return {
                bySessionId: {},

                ensure: (sessionId) => {
                    const cur = get().bySessionId[sessionId];
                    if (cur) {
                        // touch
                        set((s) => ({
                            bySessionId: {
                                ...s.bySessionId,
                                [sessionId]: { ...s.bySessionId[sessionId], lastUsedAt: Date.now() },
                            },
                        }));
                        return;
                    }

                    set((s) => {
                        const next = { ...s.bySessionId, [sessionId]: empty() };
                        return { bySessionId: pruneSessions(next) };
                    });
                },

                setArrayStrategy: (sessionId, path, strategy) => {
                    get().ensure(sessionId);
                    set((s) => ({
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: {
                                ...s.bySessionId[sessionId],
                                arrayStrategies: {
                                    ...s.bySessionId[sessionId].arrayStrategies,
                                    [path]: strategy,
                                },
                            },
                        },
                    }));
                },

                clearArrayStrategy: (sessionId, path) => {
                    get().ensure(sessionId);
                    set((s) => {
                        const next = { ...s.bySessionId[sessionId].arrayStrategies };
                        delete next[path];
                        return {
                            bySessionId: {
                                ...s.bySessionId,
                                [sessionId]: { ...s.bySessionId[sessionId], arrayStrategies: next },
                            },
                        };
                    });
                },

                selectDoc: (sessionId, path, docId) => {
                    get().ensure(sessionId);
                    set((s) => ({
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: {
                                ...s.bySessionId[sessionId],
                                selections: {
                                    ...s.bySessionId[sessionId].selections,
                                    [path]: { kind: MergeSelectionEnum.kind.DOC, doc_id: docId },
                                },
                            },
                        },
                    }));
                },

                selectManual: (sessionId, path, value) => {
                    get().ensure(sessionId);
                    set((s) => ({
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: {
                                ...s.bySessionId[sessionId],
                                selections: {
                                    ...s.bySessionId[sessionId].selections,
                                    [path]: { kind: MergeSelectionEnum.kind.MANUAL, manual_value: value },
                                },
                            },
                        },
                    }));
                },

                clearSelection: (sessionId, path) => {
                    get().ensure(sessionId);
                    set((s) => {
                        const next = { ...s.bySessionId[sessionId].selections };
                        delete next[path];
                        return {
                            bySessionId: {
                                ...s.bySessionId,
                                [sessionId]: { ...s.bySessionId[sessionId], selections: next },
                            },
                        };
                    });
                },

                clearAllSelections: (sessionId) => {
                    get().ensure(sessionId);
                    set((s) => ({
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: { ...s.bySessionId[sessionId], selections: {} },
                        },
                    }));
                },

                clearSelectionsUnder: (sessionId, path) => {
                    get().ensure(sessionId);
                    set((s) => {
                        const cur = s.bySessionId[sessionId].selections;
                        const next: typeof cur = {};

                        for (const k of Object.keys(cur)) {
                            if (k === path) continue; // we'll overwrite it anyway
                            if (isDescendantPath(k, path)) continue; // delete descendants
                            next[k] = cur[k];
                        }

                        return {
                            bySessionId: {
                                ...s.bySessionId,
                                [sessionId]: {
                                    ...s.bySessionId[sessionId],
                                    selections: next,
                                },
                            },
                        };
                    });
                },

                setChildrenByPath: (sessionId, index) => {
                    get().ensure(sessionId);
                    set((s) => ({
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: {
                                ...s.bySessionId[sessionId],
                                childrenByPath: index,
                            },
                        },
                    }));
                },

                selectDocSmart: (sessionId, path, docId) => {
                    setSelectionSmart(sessionId, path, {
                        kind: MergeSelectionEnum.kind.DOC,
                        doc_id: docId,
                    });
                },

                selectManualSmart: (sessionId, path, value) => {
                    setSelectionSmart(sessionId, path, {
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
                            selections: per.selections,
                            lastUsedAt: per.lastUsedAt,
                            childrenByPath: {}, // drop derived data
                        } satisfies PerSession,
                    ])
                ),
            }),
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
    path: string
): string | null {
    // parentPaths returns [path, parent, grandparent, ..., ""]
    const ps = parentPaths(path).slice(1); // skip self
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