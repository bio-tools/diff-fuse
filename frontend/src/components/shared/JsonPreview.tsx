import styles from "./JsonPreview.module.css";

type Props = {
    text: string;
};

export function JsonPreview({ text }: Props) {
    return (
        <pre className={`${styles.preview} code`}>
            {text}
        </pre>
    );
}