import { useState } from 'react';
import styles from './DocPanel.module.css';
import { Trash2 } from 'lucide-react';
import { DocName } from './forms/DocName';
import { DocContent } from './forms/DocContent';

export type Draft = {
    doc_id: string;
    name: string;
    content: string;
};

type Props = {
    draft: Draft;
    isBusy: boolean;
    inSession: boolean;
    onUpdate: (docId: string, patch: Partial<Pick<Draft, "name" | "content">>) => void;
    onTrash: (docId: string) => void;
};

export function DocPanel({ draft, isBusy, inSession, onUpdate, onTrash }: Props) {
    return (
        <div className={styles.panel}>
            <div className={styles.headerRow}>
                <DocName
                    name={draft.name}
                    onChangeName={(name) => onUpdate(draft.doc_id, { name })}
                />
                <button
                    onClick={() => onTrash(draft.doc_id)}
                    disabled={isBusy}
                    type="button"
                    className="button primary"
                >
                    <Trash2 className='icon'/>
                </button>
            </div>

            <div className={styles.contentRow}>
                <DocContent
                    content={draft.content}
                    onChangeContent={(content) => onUpdate(draft.doc_id, { content })}
                    placeholder="{ ... }"
                />
            </div>
        </div>
    );
}