import React from 'react';
import type { DiffNode } from '../api/generated';
import { NodeKind, ArrayStrategyMode } from '../api/generated';
import { useDiffFuseStore } from '../state/diffFuseStore';
import Collapsible from './Collapsible';
import { getAtPath } from '../utils/jsonPath';

function renderValue(v: any) {
    if (v === undefined) return <span style={{ opacity: 0.6 }}>—</span>;
    if (v === null) return 'null';
    if (typeof v === 'string') return v;
    return <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(v, null, 2)}</pre>;
}

export default function DiffNodeView({
    node,
    docIds,
    mergedRoot,
}: {
    node: DiffNode;
    docIds: string[];
    mergedRoot: any;
}) {
    const selections = useDiffFuseStore((s) => s.selections);
    const selectDoc = useDiffFuseStore((s) => s.selectDoc);

    const arrayStrategies = useDiffFuseStore((s) => s.arrayStrategies);
    const setArrayStrategy = useDiffFuseStore((s) => s.setArrayStrategy);

    const isArray = node.kind === NodeKind.ARRAY;
    const title = node.path === '' ? '(root)' : node.path;

    const right = isArray ? (
        <ArrayStrategyControl
            path={node.path}
            strategy={arrayStrategies[node.path]}
            onChange={(st) => setArrayStrategy(node.path, st)}
        />
    ) : null;

    const mergedValue = mergedRoot ? getAtPath(mergedRoot, node.path) : undefined;

    const selected = selections[node.path]?.kind === 'doc' ? selections[node.path]?.doc_id : null;

    return (
        <Collapsible
            title={
                <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span>{title}</span>
                    <span style={{ opacity: 0.6, fontSize: 12 }}>{node.status}</span>
                    {node.message && <span style={{ color: '#b00', fontSize: 12 }}>{node.message}</span>}
                </span>
            }
            right={right}
            defaultOpen={node.path === ''} // root open by default
        >
            {/* leaf-ish view: show columns */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${docIds.length + 1}, 1fr)`, gap: 12 }}>
                {docIds.map((docId) => {
                    const pd = node.per_doc?.[docId];
                    const present = pd?.present;
                    const value = present ? pd?.value : undefined;

                    const isSelected = selected === docId;
                    return (
                        <div
                            key={docId}
                            onClick={() => selectDoc(node.path, docId)}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: 8,
                                padding: 10,
                                cursor: 'pointer',
                                outline: isSelected ? '2px solid #333' : 'none',
                            }}
                        >
                            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{docId}</div>
                            {!present ? <span style={{ opacity: 0.6 }}>(missing)</span> : renderValue(value)}
                        </div>
                    );
                })}

                <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>merged</div>
                    {renderValue(mergedValue)}
                </div>
            </div>

            {/* children */}
            {node.children?.length ? (
                <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                    {node.children.map((c) => (
                        <DiffNodeView key={c.path} node={c} docIds={docIds} mergedRoot={mergedRoot} />
                    ))}
                </div>
            ) : null}
        </Collapsible>
    );
}

function ArrayStrategyControl({
    path,
    strategy,
    onChange,
}: {
    path: string;
    strategy: any;
    onChange: (s: any) => void;
}) {
    const mode = strategy?.mode ?? ArrayStrategyMode.INDEX;
    const key = strategy?.key ?? '';

    return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
                value={mode}
                onChange={(e) => {
                    const m = e.target.value as ArrayStrategyMode;
                    onChange(m === ArrayStrategyMode.KEYED ? { mode: m, key: key || 'id' } : { mode: m });
                }}
            >
                <option value={ArrayStrategyMode.INDEX}>index</option>
                <option value={ArrayStrategyMode.KEYED}>keyed</option>
                <option value={ArrayStrategyMode.SIMILARITY}>similarity</option>
            </select>

            {mode === ArrayStrategyMode.KEYED && (
                <input
                    value={key}
                    placeholder="key"
                    onChange={(e) => onChange({ mode: ArrayStrategyMode.KEYED, key: e.target.value })}
                    style={{ width: 120 }}
                />
            )}
        </div>
    );
}