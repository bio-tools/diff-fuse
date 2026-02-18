import React from 'react';

export default function Collapsible({
    title,
    right,
    defaultOpen = true,
    children,
}: {
    title: React.ReactNode;
    right?: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = React.useState(defaultOpen);

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    background: '#fafafa',
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
                onClick={() => setOpen((v) => !v)}
            >
                <div style={{ fontWeight: 600 }}>{title}</div>
                <div style={{ marginLeft: 'auto' }} onClick={(e) => e.stopPropagation()}>
                    {right}
                </div>
            </div>

            {open && <div style={{ padding: 12 }}>{children}</div>}
        </div>
    );
}