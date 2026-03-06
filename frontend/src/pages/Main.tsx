import { Input } from '../components/Input';
import { DiffFuse } from '../components/DiffFuse';
import styles from './Main.module.css';
import { useSyncedScrollX } from "../hooks";

export default function Main() {
    const { aRef: rawStripRef, bRef: diffStripRef } = useSyncedScrollX();

    return (
        <div className={styles.page}>
            <div className={styles.contentRow}>
                <Input docStripRef={rawStripRef} />
            </div>
            <div className={styles.contentRow}>
                <DiffFuse docStripRef={diffStripRef} />
            </div>
        </div>
    );
}