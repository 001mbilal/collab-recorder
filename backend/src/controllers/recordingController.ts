import { Response } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import fs from "fs";
import path from "path";

import db from "../config/database";
import { AuthRequest, Recording } from "../types";
import { createError } from "../middleware/errorHandler";

export const createRecording = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError("User not authenticated", 401);
    }

    if (!req.file) {
      throw createError("No file uploaded", 400);
    }

    // Store only the filename, not the full path
    const filepath = req.file.filename;

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO recordings (user_id, filepath) VALUES (?, ?)",
      [req.userId, filepath]
    );

    res.status(201).json({
      message: "Recording saved successfully",
      recording: {
        id: result.insertId,
        user_id: req.userId,
        filepath,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getUserRecordings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId, 10);

    if (!req.userId) {
      throw createError("User not authenticated", 401);
    }

    // Ensure users can only access their own recordings
    if (req.userId !== userId) {
      throw createError("Unauthorized to access these recordings", 403);
    }

    const [recordings] = await db.query<RowDataPacket[]>(
      "SELECT id, user_id, filepath, created_at FROM recordings WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json({
      recordings: recordings as Recording[],
    });
  } catch (error) {
    throw error;
  }
};

export const deleteRecording = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const recordingId = parseInt(req.params.recordingId, 10);

    if (!req.userId) {
      throw createError("User not authenticated", 401);
    }

    // Get recording details first
    const [recordings] = await db.query<RowDataPacket[]>(
      "SELECT id, user_id, filepath FROM recordings WHERE id = ?",
      [recordingId]
    );

    if (recordings.length === 0) {
      throw createError("Recording not found", 404);
    }

    const recording = recordings[0] as Recording;

    // Ensure user owns this recording
    if (recording.user_id !== req.userId) {
      throw createError("Unauthorized to delete this recording", 403);
    }

    // Delete file from filesystem
    const uploadsDir = path.join(__dirname, "../../uploads");
    const filePath = path.join(uploadsDir, recording.filepath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await db.query<ResultSetHeader>("DELETE FROM recordings WHERE id = ?", [
      recordingId,
    ]);

    res.json({
      message: "Recording deleted successfully",
    });
  } catch (error) {
    throw error;
  }
};
