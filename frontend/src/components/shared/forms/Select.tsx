/**
 * Lightweight custom select built on Floating UI.
 *
 * Notes
 * -----
 * - The dropdown is rendered in a portal.
 * - Outside-click handling is written defensively because Floating UI refs may
 *   temporarily point to non-Element values.
 */

import { useState, useEffect } from "react";
import { useFloating, autoUpdate, offset, flip, shift } from "@floating-ui/react";
import styles from "./Select.module.css";
import Portal from "./Portal";

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

function isElement(x: unknown): x is Element {
    return !!x && typeof x === "object" && (x as any).nodeType === 1;
}

/**
 * Uncontrolled dropdown select for small option lists.
 *
 * This component owns only its open/closed state. The selected value itself is
 * controlled by the parent via `value` and `onChange`.
 */
export function CustomSelect<T>({ value, options, onChange, fixedWidth }: Props<T>) {
    const [open, setOpen] = useState(false);

    const selected = options.find((opt) => String(opt.value) === String(value));
    const displayLabel =
        selected?.slice ? selected.label.slice(0, selected.slice) : selected?.label ?? "n/a";

    const { refs, floatingStyles } = useFloating({
        open,
        onOpenChange: setOpen,
        middleware: [offset(8), flip(), shift()],
        whileElementsMounted: autoUpdate,
        placement: "bottom-end",
    });

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

    // Close on escape
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    // Close on outside click (VirtualElement-safe)
    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as Node | null;
            if (!target) return;

            const refAny = refs.reference.current as unknown;
            const floatAny = refs.floating.current as unknown;

            const refEl = isElement(refAny) ? refAny : null;
            const floatEl = isElement(floatAny) ? floatAny : null;

            if (refEl && refEl.contains(target)) return;
            if (floatEl && floatEl.contains(target)) return;

            setOpen(false);
        };

        window.addEventListener("pointerdown", onPointerDown, { capture: true });
        return () => {
            window.removeEventListener("pointerdown", onPointerDown, { capture: true } as any);
        };
    }, [open, refs]);

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