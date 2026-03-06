import type { ArrayStrategy } from "../../../api/generated";
import { ArrayStrategyMode } from "../../../api/generated";
import { CustomSelect, type Option } from "../../shared/forms/Select";

type Props = {
    path: string;
    strategy?: ArrayStrategy;
    onChange: (s: ArrayStrategy) => void;
};

export function ArrayStrategyControl({ strategy, onChange }: Props) {
    const mode = strategy?.mode ?? ArrayStrategyMode.INDEX;
    const key = strategy?.key ?? "";

    const options: Option<ArrayStrategyMode>[] = [
        { label: "index", value: ArrayStrategyMode.INDEX },
        { label: "keyed", value: ArrayStrategyMode.KEYED },
        { label: "similarity", value: ArrayStrategyMode.SIMILARITY },
    ];

    const onModeChange = (m: ArrayStrategyMode) => {
        if (m === ArrayStrategyMode.KEYED) {
            onChange({ mode: m, key: key || "id" });
        } else {
            onChange({ mode: m });
        }
    };

    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {mode === ArrayStrategyMode.KEYED && (
                <input
                    value={key}
                    placeholder="key"
                    onChange={(e) => onChange({ mode: ArrayStrategyMode.KEYED, key: e.target.value })}
                    style={{ width: 120 }}
                    className="input singleline highlighted"
                />
            )}

            <CustomSelect<ArrayStrategyMode>
                value={mode}
                options={options}
                onChange={onModeChange}
                // fixedWidth={110}
            />
        </div>
    );
}