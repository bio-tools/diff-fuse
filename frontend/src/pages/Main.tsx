import { DiffFuse } from "../components/DiffFuse";
import { Input } from "../components/Input";
import { NewSession } from "../components/NewSession";
import { useScrollSyncX } from "../hooks";
import styles from "./Main.module.css";

export default function Main() {
    const rawStripRef = useScrollSyncX("raw-strip");

    return (
        <div className={styles.page}>
            <div className={styles.contentRow}>
                <div className={styles.flexRow}>
                    <Input docStripRef={rawStripRef} />
                    <NewSession />
                </div>
            </div>
            <div className={styles.contentRow}>
                <DiffFuse />
            </div>
        </div>
    );
}
