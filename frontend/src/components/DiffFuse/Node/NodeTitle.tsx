import styles from './NodeTitle.module.css';

interface Props {
    title: string;
    prefix?: string;
    status?: string;
    rightButtons?: React.ReactNode;
}

export function NodeTitle({ title, prefix, status, rightButtons }: Props) {

    return (
        <div className={styles.title}>
            <div className={styles.titleLeft}>
                <div className={styles.titleAndStatus}>
                    <div className={styles.titleText}>
                        {prefix && <span className={styles.prefix}>{prefix}</span>}
                        <span className={styles.mainTitle}>{title}</span>
                    </div>
                    {status && <span className={styles.status}>({status})</span>}
                </div>
            </div>
            {rightButtons && <div className={styles.rightButtons}>{rightButtons}</div>}
        </div>
    );
}