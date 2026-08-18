import { ChevronDown, ChevronUp } from "lucide-react";
import type React from "react";
import styles from "./DiffRow.module.css";

interface Props {
    title: React.ReactNode;
    children: React.ReactNode;
    /**
     * Controlled by the caller so expand/collapse-all can drive every row at
     * once. Row state lives in the session store, keyed by node id.
     */
    open: boolean;
    onToggle: () => void;
}

export function DiffRow({ title, children, open, onToggle }: Props) {
    return (
        <div>
            <div className={styles.header}>
                <button type="button" className="button transparent accent" onClick={onToggle}>
                    {open ? <ChevronUp className="icon" /> : <ChevronDown className="icon" />}
                </button>
                {title}
            </div>

            {open && <div className={styles.content}>{children}</div>}
        </div>
    );
}
