function envFlag(value: unknown, defaultValue = false): boolean {
    if (typeof value !== "string") return defaultValue;

    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

export const features = {
    mergeEditing: envFlag(import.meta.env.VITE_ENABLE_MERGE_EDITING, true),
} as const;