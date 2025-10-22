import express, { NextFunction, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { authenticateToken } from "../middleware/auth";
import {
  createRecording,
  deleteRecording,
  getUserRecordings,
} from "../controllers/recordingController";
import { AuthRequest } from "../types";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (
    _req: express.Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadsDir);
  },
  filename: (
    _req: express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `recording-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (
    _req: express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedTypes = ["video/webm", "video/mp4", "audio/webm", "audio/wav"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only video/audio files are allowed."));
    }
  },
});

router.post(
  "/",
  authenticateToken,
  upload.single("recording"),
  (req: AuthRequest, res: Response, next: NextFunction) => {
    createRecording(req, res).catch(next);
  }
);

router.get(
  "/user/:userId",
  authenticateToken,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    getUserRecordings(req, res).catch(next);
  }
);

router.delete(
  "/:recordingId",
  authenticateToken,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    deleteRecording(req, res).catch(next);
  }
);

export default router;
