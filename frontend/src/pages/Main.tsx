import { DiffFuse } from "../components/DiffFuse";
import { Input } from "../components/Input";
import { Utils } from "../components/Utils";
import { useScrollSyncX } from "../hooks";
import styles from "./Main.module.css";

export default function Main() {
    const rawStripRef = useScrollSyncX("raw-strip");

    return (
        <div className={styles.page}>
            <div className={styles.contentRow}>
                <div className={styles.flexRow}>
                    <Input docStripRef={rawStripRef} />
                    <Utils />
                </div>
            </div>
            <div className={styles.contentRow}>
                <DiffFuse />
            </div>
        </div>
    );
}
