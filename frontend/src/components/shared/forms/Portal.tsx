import { createPortal } from "react-dom";
import { useMemo } from "react";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function Portal({ children }: Props) {
    const mount = useMemo(() => {
        let el = document.getElementById("ui-portal");
        if (!el) {
            el = document.createElement("div");
            el.id = "ui-portal";
            document.body.appendChild(el);
        }
        return el;
    }, []);

    return createPortal(children, mount);
}