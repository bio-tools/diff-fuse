import styles from './DocInput.module.css';
import { Trash2 } from 'lucide-react';
import { TextInput } from '../shared/forms/TextInput';
import { TextAreaInput } from '../shared/forms/TextAreaInput';

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
                {/* title entry */}
                <TextInput
                    name={draft.name} //{`draft.name (${inSession})`}
                    onChangeName={(name) => onUpdate(draft.doc_id, { name })}
                    disabled={isBusy || inSession}
                />
                {/* delete button */}
                <button
                    onClick={() => onTrash(draft.doc_id)}
                    disabled={isBusy}
                    type="button"
                    className="button primary"
                >
                    <Trash2 className='icon' />
                </button>
            </div>

            {/* raw file entry */}
            <div className={styles.contentRow}>
                <TextAreaInput
                    content={draft.content}
                    onChangeContent={(content) => onUpdate(draft.doc_id, { content })}
                    placeholder="{ ... }"
                    disabled={isBusy || inSession}
                    isCode={true}
                />
            </div>
        </div>
    );
}