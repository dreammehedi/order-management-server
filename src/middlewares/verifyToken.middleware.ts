import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";

declare global {
  namespace Express {
    interface Request {
      user_id?: string;
      username?: string;
      phone_number?: string;
      role?: string;
      token?: string;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      title: "401",
      message: "You are not authenticated!",
    });
  }

  jwt.verify(token, JWT_SECRET as string, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({
        title: "403",
        message: "Token is not valid or expired.",
      });
    }

    (req as any).user_id = decoded.id;
    (req as any).username = decoded.username;
    (req as any).role = decoded.role;
    (req as any).token = token;

    next();
  });
};
