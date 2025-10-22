import { Request } from "express";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export interface Recording {
  id: number;
  user_id: number;
  filepath: string;
  created_at: Date;
}

export interface AuthRequest extends Request {
  userId?: number;
  file?: Express.Multer.File | undefined;
}

export interface JWTPayload {
  userId: number;
  email: string;
}
