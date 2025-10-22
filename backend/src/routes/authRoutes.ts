import express, { NextFunction, Request, Response } from "express";

import { login, register } from "../controllers/authController";

const router = express.Router();

router.post("/register", (req: Request, res: Response, next: NextFunction) => {
  register(req, res).catch(next);
});

router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  login(req, res).catch(next);
});

export default router;
