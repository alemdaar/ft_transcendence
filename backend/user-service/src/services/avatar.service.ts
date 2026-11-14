
import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { HttpError } from "../lib/http-error";

export const avatarDir = path.resolve(
    process.env.AVATAR_UPLOAD_DIR ?? "uploads/avatars"
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
