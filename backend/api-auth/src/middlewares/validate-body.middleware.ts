import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse({ body: req.body });
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors.body?.[0] ?? parsed.error.message;
      res.status(400).json({
        success: false,
        error: { message: String(first) },
      });
      return;
    }
    req.body = parsed.data.body;
    next();
  };
}
