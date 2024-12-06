export function getBackendOrigin(): string {
    if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
    if (typeof window !== "undefined") {
        return window.location.origin;
    }
    return "";
}
