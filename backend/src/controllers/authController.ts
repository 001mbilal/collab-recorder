import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { z } from "zod";

import db from "../config/database";
import { createError } from "../middleware/errorHandler";
import { loginSchema, registerSchema } from "../validators/auth";
import { User } from "../types";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    // Check if user already exists
    const [existingUsers] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      throw createError("User with this email already exists", 409);
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, password_hash]
    );

    const userId = result.insertId;

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError("JWT_SECRET not configured", 500);
    }

    const token = jwt.sign(
      { userId, email },
      jwtSecret,
      // Type assertion due to @types/jsonwebtoken compatibility
      { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" } as jwt.SignOptions
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        name,
        email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
      return;
    }
    throw error;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user
    const [users] = await db.query<RowDataPacket[]>(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      throw createError("Invalid email or password", 401);
    }

    const user = users[0] as User;

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw createError("Invalid email or password", 401);
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError("JWT_SECRET not configured", 500);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      // Type assertion due to @types/jsonwebtoken compatibility
      { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" } as jwt.SignOptions
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
      return;
    }
    throw error;
  }
};
