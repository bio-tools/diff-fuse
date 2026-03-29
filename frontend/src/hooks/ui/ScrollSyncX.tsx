/**
 * Horizontal scroll synchronization for document/merge columns.
 *
 * This module lets multiple horizontally scrollable containers behave as one
 * synchronized strip. Any registered scroller can become the source; its
 * `scrollLeft` is broadcast to the others.
 *
 * Design notes
 * ------------
 * - Synchronization is in-memory only and local to the mounted provider.
 * - Late-mounted scrollers are snapped to the latest shared position.
 * - A guard prevents feedback loops from programmatic `scrollLeft` updates.
 */

import * as React from "react";

type ScrollSyncCtx = {
    register: (id: string, el: HTMLDivElement) => void;
    unregister: (id: string) => void;
    notifyScroll: (sourceId: string, left: number) => void;
    getLastLeft: () => number;
};

const ScrollSyncContext = React.createContext<ScrollSyncCtx | null>(null);

/**
 * Provide shared horizontal scroll state to descendant scrollers.
 */
export function ScrollSyncXProvider({ children }: { children: React.ReactNode }) {
    const elsRef = React.useRef(new Map<string, HTMLDivElement>());
    const lastLeftRef = React.useRef(0);

    // Prevent feedback loops: when we programmatically update peer scrollers,
    // their native `scroll` events should not trigger another broadcast cycle.
    const syncingFromRef = React.useRef<string | null>(null);

    const getLastLeft = React.useCallback(() => lastLeftRef.current, []);

    /**
     * Broadcast the latest horizontal scroll position from one registered source
     * to all other registered scrollers.
     */
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

    /**
     * Register a scroller and snap it to the current shared position.
     */
    const register = React.useCallback((id: string, el: HTMLDivElement) => {
        elsRef.current.set(id, el);

        // Snap late joiners to the current global position
        const left = lastLeftRef.current;
        if (Math.abs(el.scrollLeft - left) > 0.5) {
            el.scrollLeft = left;
        }
    }, []);

    const unregister = React.useCallback((id: string) => {
        elsRef.current.delete(id);
    }, []);

    const value = React.useMemo<ScrollSyncCtx>(
        () => ({ register, unregister, notifyScroll, getLastLeft }),
        [register, unregister, notifyScroll, getLastLeft]
    );

    return <ScrollSyncContext.Provider value={value}> {children} </ScrollSyncContext.Provider>;
}

/**
 * Register a horizontally scrollable element in the shared sync group.
 *
 * Returns a callback ref that must be attached to the scrollable `div`.
 *
 * Behavior
 * --------
 * - On mount, the element is registered and aligned to the latest shared X position.
 * - On user scroll, the element becomes the broadcast source.
 * - On unmount or ref replacement, listeners are cleaned up.
 *
 * Notes
 * -----
 * This hook must be used inside `ScrollSyncXProvider`.
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

    // Callback ref handles both mount and replacement of the underlying DOM node.
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
