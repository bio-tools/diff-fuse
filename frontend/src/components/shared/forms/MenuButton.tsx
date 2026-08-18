/**
 * Icon-triggered dropdown menu.
 *
 * Sibling of `CustomSelect`: same floating/dismiss behaviour and the same
 * dropdown styling, but the trigger is an icon and the entries are actions
 * rather than values. Use it when the choices are commands ("Expand all"), or
 * when a value picker needs an icon trigger instead of a text label.
 */

import { Check } from "lucide-react";
import type React from "react";
import Portal from "./Portal";
import styles from "./Select.module.css";
import { useFloatingMenu } from "./useFloatingMenu";

export type MenuItem = {
    label: string;
    onSelect: () => void;
    /**
     * Marks the entry as the current choice. Omit for plain actions -- a menu
     * where no entry declares `active` renders without the checkmark gutter.
     */
    active?: boolean;
};

type Props = {
    icon: React.ReactNode;
    items: MenuItem[];
    title: string;
    disabled?: boolean;
    /** Visual variant, matching the global button classes. */
    variant?: string;
};

export function MenuButton({ icon, items, title, disabled = false, variant = "primary" }: Props) {
    const { open, setOpen, refs, floatingStyles } = useFloatingMenu();

    // Only reserve the checkmark gutter for menus that actually track a choice.
    const showCheck = items.some((item) => item.active !== undefined);

    return (
        <div className={styles.wrapper}>
            <button
                ref={refs.setReference}
                type="button"
                className={`button ${variant}`}
                onClick={() => setOpen((v) => !v)}
                disabled={disabled}
                title={title}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                {icon}
            </button>

            {open && !disabled && (
                <Portal>
                    <ul
                        ref={refs.setFloating}
                        className={styles.dropdown}
                        style={{
                            ...floatingStyles,
                            zIndex: 2000,
                            position: "absolute",
                            pointerEvents: "auto",
                        }}
                    >
                        {items.map((item) => (
                            <li key={item.label} className={styles.option}>
                                {/* A real button so the entry is focusable and works
                                    from the keyboard, not just the pointer. */}
                                <button
                                    type="button"
                                    className={styles.optionButton}
                                    onClick={() => {
                                        item.onSelect();
                                        setOpen(false);
                                    }}
                                >
                                    {showCheck && (
                                        <span className={styles.optionCheck}>
                                            {item.active && <Check className="icon" />}
                                        </span>
                                    )}
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </Portal>
            )}
        </div>
    );
}
