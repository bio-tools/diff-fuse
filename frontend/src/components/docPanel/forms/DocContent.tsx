type Props = {
    content: string;
    rows?: number;
    placeholder?: string;
    onChangeContent: (next: string) => void;
    disabled: boolean;
};

export function DocContent({
    content,
    rows = 10,
    placeholder = "{ ... }",
    onChangeContent,
    disabled,
}: Props) {
    return (
        <textarea
            className="input textarea"
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            disabled={disabled}
            rows={rows}
            placeholder={placeholder}
        />
    );
}