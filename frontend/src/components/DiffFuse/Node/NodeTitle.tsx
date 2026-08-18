import { DiffStatus } from "../../../api/generated";
import { statusLabel } from "../statusLabels";
import styles from "./NodeTitle.module.css";

interface Props {
    title: string;
    prefix?: string;
    status?: DiffStatus;
    rightButtons?: React.ReactNode;
}

export function NodeTitle({ title, prefix, status, rightButtons }: Props) {
    return (
        <div className={styles.title}>
            <div className={styles.titleAndStatus}>
                <div className={styles.titleText}>
                    {prefix && <span className={styles.prefix}>{prefix}</span>}
                    <span className={styles.mainTitle}>{title}</span>
                </div>
                {status && status !== DiffStatus.SAME && (
                    <span className={`${styles.status} ${status === DiffStatus.TYPE_ERROR ? styles.attention : ""}`}>
                        {statusLabel(status)}
                    </span>
                )}
            </div>
            {rightButtons && <div className={styles.rightButtons}>{rightButtons}</div>}
        </div>
    );
}
