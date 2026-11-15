
import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import sharp from "sharp";
import { HttpError } from "../lib/http-error";


export const avatarDir = path.resolve(
    process.env.AVATAR_UPLOAD_DIR ??
    path.join(__dirname, "..", "..", "uploads", "avatars")
);

export async function saveAvatar(
    buffer: Buffer,
    userId: number
): Promise<string> {
    let imageBuffer: Buffer;

    try {
        const image = sharp(buffer, {
            limitInputPixels: 20_000_000,
            failOn: "error"
        });

        const metadata = await image.metadata();

        if (!["jpeg", "png", "webp"].includes(metadata.format ?? "")) {
            throw new HttpError(400, "Unsupported image format");
        }

        imageBuffer = await image
            .rotate()
            .resize(512, 512, { fit: "cover" })
            .webp({ quality: 80 })
            .toBuffer();
    } catch (error) {
        if (error instanceof HttpError) throw error;
        throw new HttpError(400, "Invalid avatar image");
    }

    await mkdir(avatarDir, { recursive: true });

    const filename = `${userId}-${crypto.randomUUID()}.webp`;

    await writeFile(
        path.join(avatarDir, filename),
        imageBuffer,
        { flag: "wx" }
    );

    return `/auth/avatars/${filename}`;
}

export async function removeLocalAvatar(
    avatarUrl: string | null | undefined,
    userId: number
): Promise<void> {
    if (!avatarUrl) return;

    const filename = path.basename(avatarUrl);

    const pattern = new RegExp(
        `^${userId}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.webp$`
    );

    if (
        avatarUrl !== `/auth/avatars/${filename}` ||
        !pattern.test(filename)
    ) return;

    await unlink(path.join(avatarDir, filename))
        .catch(error => {
            if (error.code !== "ENOENT") throw error;
        });
}
