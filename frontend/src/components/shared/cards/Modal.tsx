import React from "react";
import { X } from "lucide-react";
import styles from "./Modal.module.css";
import { CardTitle } from "./CardTitle";

type Props = {
    title: string;
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    rightButtons?: React.ReactNode;
};


export function Modal({ title, open, onClose, children, rightButtons }: Props) {
    React.useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <div className={styles.header}>
                    <CardTitle title={title} rightButtons={null} />

                    <div className={styles.actions}>
                        {rightButtons}
                        <button
                            type="button"
                            className="button transparent"
                            onClick={onClose}
                            title="Close preview"
                        >
                            <X className="icon" />
                        </button>
                    </div>
                </div>

                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
}