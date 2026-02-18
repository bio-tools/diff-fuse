import styles from './NodeTitle.module.css';

interface Props {
    title: string;
    status?: string;
    rightButtons?: React.ReactNode;
}

export function NodeTitle({ title, status, rightButtons }: Props) {

    return (
        <div className={styles.title}>
            <div className={styles.titleLeft}>
                <div className={styles.titleAndStatus}>
                    <div className={styles.titleText}>
                        | {title}
                    </div>
                    {status && <span className={styles.status}>({status})</span>}
                </div>
            </div>
            {rightButtons && <div className={styles.rightButtons}>{rightButtons}</div>}
        </div>
    );
}