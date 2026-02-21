type Props = {
    error: string;
};

export function Error({ error }: Props) {
    return (
        <div style={{ color: '#b00' }}>
            {error}
        </div>
    );
}