/**
 * Lightweight custom select built on Floating UI.
 *
 * Notes
 * -----
 * - The dropdown is rendered in a portal.
 * - Open/close and dismiss behaviour come from `useFloatingMenu`, shared with
 *   `MenuButton` so every dropdown here behaves the same.
 */

import { useEffect, useState } from "react";
import Portal from "./Portal";
import styles from "./Select.module.css";
import { useFloatingMenu } from "./useFloatingMenu";

/**
 * One selectable option for `CustomSelect`.
 */
export type Option<T> = {
    label: string;
    value: T;
    color?: string;
    slice?: number;
};

type Props<T> = {
    value: T;
    options: Option<T>[];
    onChange: (val: T) => void;
    fixedWidth?: string | number;
};

/**
 * Uncontrolled dropdown select for small option lists.
 *
 * This component owns only its open/closed state. The selected value itself is
 * controlled by the parent via `value` and `onChange`.
 */
export function CustomSelect<T>({ value, options, onChange, fixedWidth }: Props<T>) {
    const { open, setOpen, refs, floatingStyles } = useFloatingMenu();

    const selected = options.find((opt) => String(opt.value) === String(value));
    const displayLabel = selected?.slice ? selected.label.slice(0, selected.slice) : (selected?.label ?? "n/a");

    const [visibleLabel, setVisibleLabel] = useState(displayLabel);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        if (displayLabel !== visibleLabel) {
            setFading(true);
            const t = setTimeout(() => {
                setVisibleLabel(displayLabel);
                setFading(false);
            }, 200);
            return () => clearTimeout(t);
        }
    }, [displayLabel, visibleLabel]);

    return (
        <div className={styles.wrapper}>
            <button
                ref={refs.setReference}
                type="button"
                className={`button primary ${styles.trigger}`}
                style={{
                    // backgroundColor: selected?.color || "transparent",
                    width: fixedWidth,
                }}
                onClick={() => setOpen((v) => !v)}
            >
                <span className={`${styles.label} ${fading ? styles.fading : ""}`}>{visibleLabel}</span>
            </button>

            {open && (
                <Portal>
                    <ul
                        ref={refs.setFloating}
                        className={`${styles.dropdown}`}
                        style={{
                            ...floatingStyles,
                            zIndex: 2000,
                            position: "absolute",
                            pointerEvents: "auto",
                        }}
                    >
                        {options.map((opt) => (
                            <li
                                key={String(opt.value)}
                                className={styles.option}
                                style={{ backgroundColor: opt.color || "transparent" }}
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                </Portal>
            )}
        </div>
    );
}
