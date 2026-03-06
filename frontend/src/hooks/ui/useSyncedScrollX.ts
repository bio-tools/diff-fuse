import * as React from "react";

export function useSyncedScrollX() {
    const [aEl, setAEl] = React.useState<HTMLDivElement | null>(null);
    const [bEl, setBEl] = React.useState<HTMLDivElement | null>(null);

    const syncing = React.useRef<null | "a" | "b">(null);

    // callback refs (these run when the element mounts/unmounts)
    const aRef = React.useCallback((node: HTMLDivElement | null) => {
        setAEl(node);
    }, []);

    const bRef = React.useCallback((node: HTMLDivElement | null) => {
        setBEl(node);
    }, []);

    React.useEffect(() => {
        if (!aEl || !bEl) return;

        const onA = () => {
            if (syncing.current === "b") return;
            syncing.current = "a";
            bEl.scrollLeft = aEl.scrollLeft;
            requestAnimationFrame(() => (syncing.current = null));
        };

        const onB = () => {
            if (syncing.current === "a") return;
            syncing.current = "b";
            aEl.scrollLeft = bEl.scrollLeft;
            requestAnimationFrame(() => (syncing.current = null));
        };

        aEl.addEventListener("scroll", onA, { passive: true });
        bEl.addEventListener("scroll", onB, { passive: true });

        return () => {
            aEl.removeEventListener("scroll", onA);
            bEl.removeEventListener("scroll", onB);
        };
    }, [aEl, bEl]);

    return { aRef, bRef };
}