type Props = {
    name: string;
    onChangeName?: (next: string) => void;
    disabled?: boolean;
    isCode?: boolean;
};

export function CustomInput({ name, onChangeName, disabled, isCode }: Props) {
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

export function CustomInputLike({ name, isCode }: PropsLike) {
    return (
        <div className={`input singleline ${isCode ? 'code' : ''}`}>{name}</div>
    );
}