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
            className={`input singleline ${isCode ? 'code' : ''} ${bold ? 'bold' : ''}`}
            value={name}
            onChange={(e) => onChangeName && onChangeName(e.target.value)}
            disabled={disabled}
        />
    );
}

export function TextInputMatching({ name, onChangeName, disabled, isCode, bold }: Props) {
    return (
        <textarea
            className={`input singleline matching ${isCode ? 'code' : ''} ${bold ? 'bold' : ''}`}
            value={name}
            rows={1}
            onChange={(e) => onChangeName && onChangeName(e.target.value)}
            disabled={disabled}
        />
    );
}

type PropsLike = {
    name: any;
    onChangeName?: (next: string) => void;
    disabled?: boolean;
    isCode?: boolean;
    bold?: boolean;
};

export function TextInputLike({ name, isCode, bold }: PropsLike) {
    return (
        <div className={`input singleline ${isCode ? 'code' : ''} ${bold ? 'bold' : ''}`}>{name}</div>
    );
}


type PropsButton = {
    name: string;
    key?: string;
    onClick?: () => void;
    disabled?: boolean;
    selected?: boolean;
    isCode?: boolean;
    bold?: boolean;
};

export function TextInputButton({ name, key, onClick, disabled, selected, isCode, bold }: PropsButton) {
    return (
        <button
            key={key}
            className={`input ${selected ? 'selected' : 'deselected'} mockdisabled ${disabled ? 'disabled' : ''} ${isCode ? 'code' : ''} ${bold ? 'bold' : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            {name}
        </button>
    );
}