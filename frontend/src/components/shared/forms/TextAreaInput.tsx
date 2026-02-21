type Props = {
    content: string;
    rows?: number;
    placeholder?: string;
    onChangeContent: (next: string) => void;
    disabled: boolean;
    isCode?: boolean;
};

export function TextAreaInput({
    content,
    rows = 10,
    placeholder = "{ ... }",
    onChangeContent,
    disabled,
    isCode,
}: Props) {
    return (
        <textarea
            className={`input textarea ${isCode ? 'code' : ''}`}
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            disabled={disabled}
            rows={rows}
            placeholder={placeholder}
        />
    );
}