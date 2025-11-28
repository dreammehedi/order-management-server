import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const zodValidate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => {
          return {
            field: issue.path[0]?.toString() ?? "unknown",
            message: issue.message,
          };
        });
        return res.status(400).json({
          success: false,
          errors,
        });
      }
      next(error);
    }
  };
};
