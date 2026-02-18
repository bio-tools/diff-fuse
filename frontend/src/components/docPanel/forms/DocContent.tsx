type Props = {
    content: string;
    rows?: number;
    placeholder?: string;
    onChangeContent: (next: string) => void;
};

export function DocContent({
    content,
    rows = 10,
    placeholder = "{ ... }",
    onChangeContent,
}: Props) {
    return (
        <textarea
            className="input textarea"
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            rows={rows}
            placeholder={placeholder}
        />
    );
}