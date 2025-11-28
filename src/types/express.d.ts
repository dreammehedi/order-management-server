import "express";

declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        skip: number;
        search: string;
      };
      role?: string;
    }
  }
}
