import styles from "./CardTitle.module.css";

interface Props {
    title: string;
    rightButtons?: React.ReactNode;
}

export function CardTitle({ title, rightButtons }: Props) {
    return (
        <div className={styles.title}>
            {/* <span className={styles.titleText}>{title}</span> */}
            <h1 className={styles.titleText}>{title}</h1>
            {rightButtons && <div className={styles.rightButtons}>{rightButtons}</div>}
        </div>
    );
}
