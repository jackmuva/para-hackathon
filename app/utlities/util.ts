export function getBackendOrigin(): string {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }
    return "";
}
