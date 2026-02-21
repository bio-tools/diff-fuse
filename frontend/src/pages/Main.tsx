import { Input } from '../components/Input';
import { DiffFuse } from '../components/DiffFuse';
import styles from './Main.module.css';

export default function Main() {

    return (
        <div className={styles.page}>
            <div className={styles.contentRow}>
                <Input />
            </div>
            <div className={styles.contentRow}>
                <DiffFuse />
            </div>
        </div>
    );
}