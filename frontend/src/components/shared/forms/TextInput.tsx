type Props = {
    name: string;
    onChangeName?: (next: string) => void;
    disabled?: boolean;
    isCode?: boolean;
};

export function TextInput({ name, onChangeName, disabled, isCode }: Props) {
    return (
        <input
            className={`input singleline ${isCode ? 'code' : ''}`}
            value={name}
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
};

export function TextInputLike({ name, isCode }: PropsLike) {
    return (
        <div className={`input singleline ${isCode ? 'code' : ''}`}>{name}</div>
    );
}


type PropsButton = {
    name: string;
    key?: string;
    onClick?: () => void;
    disabled?: boolean;
    selected?: boolean;
    isCode?: boolean;
};

export function TextInputButton({ name, key, onClick, disabled, selected, isCode }: PropsButton) {
    return (
        <button
            key={key}
            className={`input singleline ${selected ? 'selected' : 'deselected'} mockdisabled ${disabled ? 'disabled' : ''} ${isCode ? 'code' : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            {name}
        </button>
    );
}