import styles from "./SegmentedToggle.module.css";

export type SegmentedOption<T extends string> = {
    value: T;
    label: string;
};

type Props<T extends string> = {
    value: T;
    options: readonly SegmentedOption<T>[];
    onChange: (value: T) => void;
    disabled?: boolean;
    title?: string;
};

export function SegmentedToggle<T extends string>({
    value,
    options,
    onChange,
    disabled = false,
    title,
}: Props<T>) {
    return (
        <div
            className={`${styles.root} ${disabled ? styles.disabled : ""}`}
            role="group"
            aria-label={title}
            title={title}
        >
            {options.map((option) => {
                const selected = option.value === value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        className={`button ${styles.option} ${selected ? styles.selected : styles.unselected}`}
                        onClick={() => onChange(option.value)}
                        disabled={disabled}
                        aria-pressed={selected}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}