import * as React from "react";

type ScrollSyncCtx = {
    register: (id: string, el: HTMLDivElement) => void;
    unregister: (id: string) => void;
    notifyScroll: (sourceId: string, left: number) => void;
    getLastLeft: () => number;
};

const ScrollSyncContext = React.createContext<ScrollSyncCtx | null>(null);

export function ScrollSyncXProvider({ children }: { children: React.ReactNode }) {
    const elsRef = React.useRef(new Map<string, HTMLDivElement>());
    const lastLeftRef = React.useRef(0);

    // Guard to prevent scroll-event feedback loops:
    // when we programmatically set scrollLeft on others, they will fire scroll events.
    const syncingFromRef = React.useRef<string | null>(null);

    const getLastLeft = React.useCallback(() => lastLeftRef.current, []);

    const notifyScroll = React.useCallback((sourceId: string, left: number) => {
        // Ignore events that are caused by our own broadcast
        if (syncingFromRef.current && syncingFromRef.current !== sourceId) return;

        lastLeftRef.current = left;

        syncingFromRef.current = sourceId;
        // Broadcast in the next frame to batch work and reduce jitter.
        requestAnimationFrame(() => {
            const els = elsRef.current;

            for (const [id, el] of els.entries()) {
                if (id === sourceId) continue;
                if (!el) continue;

                // Avoid pointless writes
                if (Math.abs(el.scrollLeft - left) > 0.5) {
                    el.scrollLeft = left;
                }
            }

            // Release guard after updates have applied
            requestAnimationFrame(() => {
                syncingFromRef.current = null;
            });
        });
    }, []);

    const register = React.useCallback(
        (id: string, el: HTMLDivElement) => {
            elsRef.current.set(id, el);

            // Snap late joiners to the current global position
            const left = lastLeftRef.current;
            if (Math.abs(el.scrollLeft - left) > 0.5) {
                el.scrollLeft = left;
            }
        },
        []
    );

    const unregister = React.useCallback((id: string) => {
        elsRef.current.delete(id);
    }, []);

    const value = React.useMemo<ScrollSyncCtx>(
        () => ({ register, unregister, notifyScroll, getLastLeft }),
        [register, unregister, notifyScroll, getLastLeft]
    );

    return <ScrollSyncContext.Provider value={ value }> { children } </ScrollSyncContext.Provider>;
}

/**
 * Hook that returns a callback-ref to attach to a horizontally scrollable div.
 * When that div scrolls, it broadcasts scrollLeft to all other registered scrollers.
 */
export function useScrollSyncX(id: string) {
    const ctx = React.useContext(ScrollSyncContext);
    if (!ctx) {
        throw new Error("useScrollSyncX must be used inside <ScrollSyncXProvider>");
    }

    const { register, unregister, notifyScroll, getLastLeft } = ctx;

    const elRef = React.useRef<HTMLDivElement | null>(null);

    // We keep the listener stable and remove it on unmount/ref change
    const onScroll = React.useCallback(() => {
        const el = elRef.current;
        if (!el) return;
        notifyScroll(id, el.scrollLeft);
    }, [id, notifyScroll]);

    // callback ref: runs on mount/unmount
    const ref = React.useCallback(
        (node: HTMLDivElement | null) => {
            // detach old
            if (elRef.current) {
                elRef.current.removeEventListener("scroll", onScroll);
                unregister(id);
            }

            elRef.current = node;

            // attach new
            if (node) {
                register(id, node);

                // Ensure it starts aligned even if it mounts after a scroll already happened
                const left = getLastLeft();
                if (Math.abs(node.scrollLeft - left) > 0.5) {
                    node.scrollLeft = left;
                }

                node.addEventListener("scroll", onScroll, { passive: true });
            }
        },
        [getLastLeft, id, onScroll, register, unregister]
    );

    return ref;
}