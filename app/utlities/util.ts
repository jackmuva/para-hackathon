import crypto from "crypto";

export function getBackendOrigin(): string {
    if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
    if (typeof window !== "undefined") {
        return window.location.origin;
    }
    return "";
}

export class Encrypter {
    private algorithm: string;
    private key: Buffer;

    //this is a single point of failure as stands
    constructor() {
        this.algorithm = "aes-192-cbc";
        this.key = crypto.scryptSync(process.env.AUTH_SECRET ?? "secret", "salt", 24);
    }

    encrypt(clearText:string) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        const encrypted = cipher.update(clearText, "utf8", "hex");
        return [
            encrypted + cipher.final("hex"),
            Buffer.from(iv).toString("hex"),
        ].join("|");
    }

    decrypt(encryptedText: string) {
        const [encrypted, iv] = encryptedText.split("|");
        if (!iv) throw new Error("IV not found");
        const decipher = crypto.createDecipheriv(
            this.algorithm,
            this.key,
            Buffer.from(iv, "hex")
        );
        return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
    }
}