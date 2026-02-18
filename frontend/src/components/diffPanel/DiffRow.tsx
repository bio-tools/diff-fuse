import React, { useState } from 'react';
import styles from './DiffRow.module.css';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
    title: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function DiffRow({ title, children, defaultOpen = true }: Props) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div>
            <div className={styles.header}>
                <button
                    type="button"
                    className="button transparent"
                    onClick={() => setOpen(!open)}
                >
                    {open ? <ChevronUp className="icon" /> : <ChevronDown className="icon" />}
                </button>
                {title}
            </div>

            {open && <div className={styles.content}>{children}</div>}
        </div>
    );
}