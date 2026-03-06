import * as React from "react";
import type { ArrayStrategy } from "../../../api/generated";
import { ArrayStrategyMode } from "../../../api/generated";
import { CustomSelect, type Option } from "../../shared/forms/Select";
import styles from "./ArrayStrategyControl.module.css";

type Props = {
    path: string;
    strategy?: ArrayStrategy;
    onChange: (s: ArrayStrategy) => void;
};

export function ArrayStrategyControl({ strategy, onChange }: Props) {
    const mode = strategy?.mode ?? ArrayStrategyMode.INDEX;
    const key = strategy?.key ?? "";

    const [draftKey, setDraftKey] = React.useState(key);

    // keep local draft in sync if strategy changes externally (e.g. restore/persist)
    React.useEffect(() => {
        setDraftKey(key);
    }, [key]);

    const options: Option<ArrayStrategyMode>[] = [
        { label: "index", value: ArrayStrategyMode.INDEX },
        { label: "keyed", value: ArrayStrategyMode.KEYED },
        { label: "similarity", value: ArrayStrategyMode.SIMILARITY },
    ];

    const onModeChange = (m: ArrayStrategyMode) => {
        if (m === ArrayStrategyMode.KEYED) {
            const nextKey = (draftKey || key || "id").trim() || "id";
            onChange({ mode: m, key: nextKey });
        } else {
            onChange({ mode: m });
        }
    };

    const commitKey = () => {
        const nextKey = draftKey.trim() || "id";
        onChange({ mode: ArrayStrategyMode.KEYED, key: nextKey });
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            commitKey();
            (e.currentTarget as HTMLInputElement).blur(); // optional: collapse focus after commit
        } else if (e.key === "Escape") {
            e.preventDefault();
            setDraftKey(key); // revert to last committed value
            (e.currentTarget as HTMLInputElement).blur();
        }
    };

    return (
        <div className={styles.row}>
            {mode === ArrayStrategyMode.KEYED && (
                <input
                    value={draftKey}
                    placeholder="key"
                    onChange={(e) => setDraftKey(e.target.value)}
                    onKeyDown={onKeyDown}
                    onBlur={commitKey} // remove if only on enter
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