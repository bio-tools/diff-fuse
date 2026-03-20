import { ChevronDown, ChevronUp } from "lucide-react";
import type React from "react";
import { useState } from "react";
import styles from "./Card.module.css";

interface Props {
    title: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function Card({ title, children, defaultOpen = true }: Props) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="card">
            <div className={styles.header}>
                <button type="button" className="button transparent" onClick={() => setOpen(!open)}>
                    {open ? <ChevronUp className="icon" /> : <ChevronDown className="icon" />}
                </button>
                {title}
            </div>

            {open && <div className={styles.content}>{children}</div>}
        </div>
    );
}
