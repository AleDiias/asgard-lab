import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      role: string;
      tenantId: string;
      permissions: string[];
      isSuperAdmin: boolean;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
