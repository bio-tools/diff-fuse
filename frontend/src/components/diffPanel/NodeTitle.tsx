import styles from './NodeTitle.module.css';

interface Props {
    title: string;
    status?: string;
    rightButtons?: React.ReactNode;
}

export function NodeTitle({ title, status, rightButtons }: Props) {

    return (
        <div className={styles.title}>
            <div className={styles.titleText}>
                | {title}
                {status && <span className={styles.status}>({status})</span>}
            </div>
            {rightButtons && <div className={styles.rightButtons}>{rightButtons}</div>}
        </div>
    );
}