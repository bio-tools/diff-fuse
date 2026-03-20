import * as React from "react";
import type { ArrayStrategy } from "../../../api/generated";
import { ArrayStrategyMode } from "../../../api/generated";
import { useSuggestArrayKeys } from "../../../hooks/diffFuse/useSuggestArrayKeys";
import { CustomSelect, type Option } from "../../shared/forms/Select";
import styles from "./ArrayStrategyControl.module.css";

type Props = {
    sessionId: string;
    nodeId: string;
    strategy?: ArrayStrategy;
    onChange: (s: ArrayStrategy) => void;
};

export function ArrayStrategyControl({
    sessionId,
    nodeId,
    strategy,
    onChange,
}: Props) {
    const committedMode = strategy?.mode ?? ArrayStrategyMode.INDEX;
    const committedKey = strategy?.key ?? "";

    const [uiMode, setUiMode] = React.useState<ArrayStrategyMode>(committedMode);
    const [draftKey, setDraftKey] = React.useState(committedKey);

    React.useEffect(() => {
        setUiMode(committedMode);
    }, [committedMode]);

    React.useEffect(() => {
        setDraftKey(committedKey);
    }, [committedKey]);

    const suggestQuery = useSuggestArrayKeys(
        sessionId,
        uiMode === ArrayStrategyMode.KEYED ? nodeId : null,
        1
    );

    const suggestedKey = suggestQuery.data?.suggestions?.[0]?.key ?? null;
    const fallbackKey = (suggestedKey ?? "id").trim();

    const options: Option<ArrayStrategyMode>[] = [
        { label: "index", value: ArrayStrategyMode.INDEX },
        { label: "keyed", value: ArrayStrategyMode.KEYED },
        { label: "value", value: ArrayStrategyMode.VALUE },
    ];

    const onModeChange = (nextMode: ArrayStrategyMode) => {
        setUiMode(nextMode);

        if (nextMode === ArrayStrategyMode.INDEX) {
            onChange({ mode: ArrayStrategyMode.INDEX });
            return;
        }

        if (nextMode === ArrayStrategyMode.VALUE) {
            onChange({ mode: ArrayStrategyMode.VALUE });
            return;
        }

        if (committedMode === ArrayStrategyMode.KEYED && committedKey.trim()) {
            setDraftKey(committedKey);
        } else {
            setDraftKey("");
        }
    };

    const commitKey = () => {
        const nextKey = draftKey.trim() || fallbackKey;
        onChange({ mode: ArrayStrategyMode.KEYED, key: nextKey });
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            commitKey();
            e.currentTarget.blur();
        } else if (e.key === "Escape") {
            e.preventDefault();
            setDraftKey(committedKey);
            setUiMode(committedMode);
            e.currentTarget.blur();
        }
    };

    return (
        <div className={styles.row}>
            {uiMode === ArrayStrategyMode.KEYED && (
                <input
                    value={draftKey}
                    placeholder={suggestQuery.isLoading ? "suggesting..." : (suggestedKey ?? "key")}
                    onChange={(e) => setDraftKey(e.target.value)}
                    onKeyDown={onKeyDown}
                    onBlur={commitKey}
                    style={{ width: 120 }}
                    className="input singleline accent highlighted"
                />
            )}

            <CustomSelect<ArrayStrategyMode>
                value={uiMode}
                options={options}
                onChange={onModeChange}
            />
        </div>
    );
}