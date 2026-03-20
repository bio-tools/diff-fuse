type Props = {
    name: string;
    onChangeName?: (next: string) => void;
    disabled?: boolean;
    isCode?: boolean;
    bold?: boolean;
};

export function TextInput({ name, onChangeName, disabled, isCode, bold }: Props) {
    return (
        <input
            className={`input singleline ${isCode ? "code" : ""} ${bold ? "bold" : ""}`}
            value={name}
            onChange={(e) => onChangeName?.(e.target.value)}
            disabled={disabled}
        />
    );
}

type MatchingProps = Props & {
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
};

export function TextInputMatching({ name, onChangeName, disabled, isCode, bold, onBlur, onKeyDown }: MatchingProps) {
    return (
        <textarea
            className={`input matching ok highlighted ${isCode ? "code" : ""} ${bold ? "bold" : ""}`}
            value={name}
            rows={1}
            onChange={(e) => onChangeName?.(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            disabled={disabled}
        />
    );
}

type PropsLike = {
    name: any;
    isCode?: boolean;
    bold?: boolean;
};

export function TextInputLike({ name, isCode, bold }: PropsLike) {
    return <div className={`input singleline ${isCode ? "code" : ""} ${bold ? "bold" : ""}`}>{name}</div>;
}

type PropsButton = {
    name: string;
    onClick?: () => void;
    disabled?: boolean;
    selected?: boolean;
    isCode?: boolean;
    bold?: boolean;
};

export function TextInputButton({ name, onClick, disabled, selected, isCode, bold }: PropsButton) {
    return (
        <button
            className={`input ${selected ? "selected" : "deselected"} mockdisabled ${disabled ? "disabled" : ""} ${
                isCode ? "code" : ""
            } ${bold ? "bold" : ""}`}
            onClick={onClick}
            disabled={disabled}
            type="button"
        >
            {name}
        </button>
    );
}
