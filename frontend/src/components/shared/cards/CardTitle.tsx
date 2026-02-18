import styles from './CardTitle.module.css';

interface Props {
    title: string;
    rightButtons?: React.ReactNode;
}

export function CardTitle({ title, rightButtons: rightButtons }: Props) {

    return (
        <div className={styles.title}>
            <span className={styles.titleText}>{title}</span>
            {rightButtons && <div className={styles.rightButtons}>{rightButtons}</div>}
        </div>
    );
}