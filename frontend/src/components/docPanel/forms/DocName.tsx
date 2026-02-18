type Props = {
    name: string;
    onChangeName: (next: string) => void;
};

export function DocName({ name, onChangeName }: Props) {
    return (
        <input
            className="input singleline"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
        />
    );
}