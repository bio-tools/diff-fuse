import React from "react";
import { ArrayStrategyMode } from "../../api/generated";

type Props = {
    path: string;
    strategy: any;
    onChange: (s: any) => void;
};

export function ArrayStrategyControl({ path, strategy, onChange }: Props) {
    const mode = strategy?.mode ?? ArrayStrategyMode.INDEX;
    const key = strategy?.key ?? "";

    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
                value={mode}
                onChange={(e) => {
                    const m = e.target.value as ArrayStrategyMode;
                    onChange(m === ArrayStrategyMode.KEYED ? { mode: m, key: key || "id" } : { mode: m });
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