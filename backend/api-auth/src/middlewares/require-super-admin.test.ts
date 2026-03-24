import { describe, expect, it } from "bun:test";
import type { NextFunction, Request, Response } from "express";
import { requireSuperAdmin } from "./require-super-admin.js";
import { ForbiddenError, UnauthorizedError } from "@/errors/app-error.js";

function makeNext() {
  const calls: unknown[] = [];
  const next: NextFunction = ((error?: unknown) => {
    calls.push(error);
  }) as NextFunction;
  return { next, calls };
}

describe("requireSuperAdmin", () => {
  it("retorna UnauthorizedError quando req.user não existe", () => {
    const { next, calls } = makeNext();
    requireSuperAdmin({} as Request, {} as Response, next);

    expect(calls.length).toBe(1);
    expect(calls[0]).toBeInstanceOf(UnauthorizedError);
  });

  it("retorna ForbiddenError quando usuário não é super admin", () => {
    const { next, calls } = makeNext();
    requireSuperAdmin(
      {
        user: {
          id: "u1",
          email: "user@demo.com",
          role: "admin",
          tenantId: "tenant-1",
          permissions: ["users:read"],
          isSuperAdmin: false,
        },
      } as Request,
      {} as Response,
      next
    );

    expect(calls.length).toBe(1);
    expect(calls[0]).toBeInstanceOf(ForbiddenError);
  });

  it("permite seguir quando usuário é super admin", () => {
    const { next, calls } = makeNext();
    requireSuperAdmin(
      {
        user: {
          id: "u2",
          email: "admin@asgardai.com.br",
          role: "asgard_employee",
          tenantId: "master",
          permissions: ["*"],
          isSuperAdmin: true,
        },
      } as Request,
      {} as Response,
      next
    );

    expect(calls.length).toBe(1);
    expect(calls[0]).toBeUndefined();
  });
});
