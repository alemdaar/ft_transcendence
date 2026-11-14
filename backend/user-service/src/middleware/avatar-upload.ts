
import multer from "multer";
import type { RequestHandler } from "express";
import { HttpError } from "../lib/http-error";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024,
        files: 1
    }
}).single("avatar");

export const avatarUpload: RequestHandler = (req, res, next) => {
    upload(req, res, error => {
        if (error instanceof multer.MulterError) {
            const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
            return next(new HttpError(status, "Invalid avatar upload"));
        }

        if (error) {
            return next(new HttpError(400, "Invalid avatar upload"));
        }

        next();
    });
};
