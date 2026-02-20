import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InputDocument, DocumentMeta } from '../api/generated';
import { DocumentFormat } from '../api/generated';

export type DraftDoc = InputDocument & {
    // purely client-side
    dirty?: boolean;
    // if a draft started local and later got committed, we can keep a mapping
    local_id?: string;
};

type RawDocsState = {
    drafts: DraftDoc[];

    addDraft: () => void;
    updateDraft: (docId: string, patch: Partial<DraftDoc>) => void;
    removeDraft: (docId: string) => void;

    ensureAtLeast: (n: number) => void;

    // NEW: server sync helpers
    upsertFromServerMeta: (meta: DocumentMeta[]) => void;
    markCommitted: (localId: string, serverDocId: string) => void;
};

function newDraft(i: number): DraftDoc {
    return {
        doc_id: crypto.randomUUID(),
        local_id: undefined,
        name: `Doc ${i}`,
        format: DocumentFormat.JSON,
        content: '',
        dirty: false,
    };
}

export const useRawDocsStore = create<RawDocsState>()(
    persist(
        (set, get) => ({
            drafts: [newDraft(1), newDraft(2)],

            addDraft: () =>
                set((s) => ({ drafts: [...s.drafts, newDraft(s.drafts.length + 1)] })),

            updateDraft: (docId, patch) =>
                set((s) => ({
                    drafts: s.drafts.map((d) =>
                        d.doc_id === docId ? { ...d, ...patch, dirty: true } : d
                    ),
                })),

            removeDraft: (docId) =>
                set((s) => ({ drafts: s.drafts.filter((d) => d.doc_id !== docId) })),

            ensureAtLeast: (n) => {
                const { drafts } = get();
                if (drafts.length >= n) return;
                const next = [...drafts];
                while (next.length < n) next.push(newDraft(next.length + 1));
                set({ drafts: next });
            },

            // NEW: Ensure drafts contain every server doc id.
            // We can't recover content from docsMeta (it has no content), so we keep existing content if we already had it;
            // otherwise we create an empty draft with the server id.
            upsertFromServerMeta: (meta) => {
                set((s) => {
                    const byId = new Map(s.drafts.map((d) => [d.doc_id, d]));
                    const next: DraftDoc[] = [...s.drafts];

                    for (const m of meta) {
                        if (byId.has(m.doc_id)) continue;

                        // try match by name as a fallback (helps if server re-ids the doc)
                        const existingByName = s.drafts.find(
                            (d) => (d.name ?? '').trim() === (m.name ?? '').trim()
                        );

                        if (existingByName) {
                            // rewrite draft to use server id
                            next.splice(
                                next.indexOf(existingByName),
                                1,
                                { ...existingByName, local_id: existingByName.local_id ?? existingByName.doc_id, doc_id: m.doc_id }
                            );
                        } else {
                            // create a placeholder draft for this server doc
                            next.push({
                                doc_id: m.doc_id,
                                local_id: undefined,
                                name: m.name ?? 'Untitled',
                                format: DocumentFormat.JSON,
                                content: '',
                                dirty: false,
                            });
                        }
                    }

                    return { drafts: next };
                });
            },

            // NEW: after commit, rewrite a local draft id to server id
            markCommitted: (localId, serverDocId) => {
                set((s) => ({
                    drafts: s.drafts.map((d) =>
                        d.doc_id === localId
                            ? {
                                ...d,
                                local_id: d.local_id ?? localId,
                                doc_id: serverDocId,
                                dirty: false,
                            }
                            : d
                    ),
                }));
            },
        }),
        {
            name: 'raw-docs-store',
            partialize: (s) => ({ drafts: s.drafts }),
        }
    )
);