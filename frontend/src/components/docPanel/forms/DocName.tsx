type Props = {
    name: string;
    onChangeName: (next: string) => void;
    disabled: boolean;
};

export function DocName({ name, onChangeName, disabled }: Props) {
    return (
        <input
            className="input singleline"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            disabled={disabled}
        />
    );
}