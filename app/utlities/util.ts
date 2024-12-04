export function getBackendOrigin(): string {
    if (typeof window !== "undefined") {
        // Use BASE_URL from window.ENV
        return (window as any).ENV?.BASE_URL || "";
    }
    return "";
}
