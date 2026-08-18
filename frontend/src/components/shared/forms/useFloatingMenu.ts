/**
 * Open/close plumbing shared by the dropdown components.
 *
 * Wraps Floating UI positioning together with the two dismiss behaviours every
 * dropdown here needs: Escape, and a pointer press outside both the trigger and
 * the panel.
 *
 * Notes
 * -----
 * - Outside-click handling is written defensively because Floating UI refs may
 *   temporarily point to non-Element values.
 */

import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/react";
import { useEffect, useState } from "react";

function isElement(x: unknown): x is Element {
    return !!x && typeof x === "object" && (x as { nodeType?: number }).nodeType === 1;
}

export function useFloatingMenu() {
    const [open, setOpen] = useState(false);

    const { refs, floatingStyles } = useFloating({
        open,
        onOpenChange: setOpen,
        middleware: [offset(8), flip(), shift()],
        whileElementsMounted: autoUpdate,
        placement: "bottom-end",
    });

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as Node | null;
            if (!target) return;

            const refEl = isElement(refs.reference.current) ? refs.reference.current : null;
            const floatEl = isElement(refs.floating.current) ? refs.floating.current : null;

            if (refEl?.contains(target)) return;
            if (floatEl?.contains(target)) return;

            setOpen(false);
        };

        window.addEventListener("pointerdown", onPointerDown, { capture: true });
        return () => {
            window.removeEventListener("pointerdown", onPointerDown, { capture: true });
        };
    }, [open, refs]);

    return { open, setOpen, refs, floatingStyles };
}
