import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export default function Portal({ children }: Props) {
    const mount = document.getElementById("ui-portal");
    return mount ? createPortal(children, mount) : null;
}