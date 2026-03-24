import { asc, eq } from "drizzle-orm";
import { masterDb } from "@/infra/database/master/connection.js";
import { asgardUsers } from "@/infra/database/master/schema.js";

export interface AsgardUserEntity {
  id: string;
  email: string;
  passwordHash: string | null;
  active: boolean;
}

export interface CreateAsgardUserInput {
  name: string;
  email: string;
}

/**
 * Repositório de usuários internos AsgardAI.
 * Implementação real deve conectar exclusivamente ao Master DB (asgard_users).
 */
export interface AsgardUserListItem {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface AsgardUserRepository {
  findByEmail(email: string): Promise<AsgardUserEntity | null>;
  createInvitedUser(input: CreateAsgardUserInput): Promise<{ id: string }>;
  updatePasswordByEmail(email: string, passwordHash: string): Promise<void>;
  listAll(): Promise<AsgardUserListItem[]>;
  setActiveById(id: string, isActive: boolean): Promise<boolean>;
}

export class AsgardUserRepositoryDrizzle implements AsgardUserRepository {
  async findByEmail(email: string): Promise<AsgardUserEntity | null> {
    const [user] = await masterDb
      .select({
        id: asgardUsers.id,
        email: asgardUsers.email,
        passwordHash: asgardUsers.passwordHash,
        active: asgardUsers.isActive,
      })
      .from(asgardUsers)
      .where(eq(asgardUsers.email, email.toLowerCase()))
      .limit(1);

    return user
      ? {
          ...user,
          passwordHash: user.passwordHash ?? null,
        }
      : null;
  }

  async createInvitedUser(input: CreateAsgardUserInput): Promise<{ id: string }> {
    const normalized = input.email.trim().toLowerCase();
    const [created] = await masterDb
      .insert(asgardUsers)
      .values({
        name: input.name.trim(),
        email: normalized,
        passwordHash: null,
        isActive: true,
      })
      .returning({ id: asgardUsers.id });

    if (!created) {
      throw new Error("Falha ao criar utilizador Asgard.");
    }

    return { id: created.id };
  }

  async updatePasswordByEmail(email: string, passwordHash: string): Promise<void> {
    const normalized = email.toLowerCase();
    const updated = await masterDb
      .update(asgardUsers)
      .set({ passwordHash })
      .where(eq(asgardUsers.email, normalized))
      .returning({ id: asgardUsers.id });
    if (updated.length === 0) {
      throw new Error("Nenhum usuário Asgard atualizado.");
    }
  }

  async listAll(): Promise<AsgardUserListItem[]> {
    const rows = await masterDb
      .select({
        id: asgardUsers.id,
        name: asgardUsers.name,
        email: asgardUsers.email,
        isActive: asgardUsers.isActive,
      })
      .from(asgardUsers)
      .orderBy(asc(asgardUsers.createdAt));

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      isActive: r.isActive,
    }));
  }

  async setActiveById(id: string, isActive: boolean): Promise<boolean> {
    const updated = await masterDb
      .update(asgardUsers)
      .set({ isActive })
      .where(eq(asgardUsers.id, id))
      .returning({ id: asgardUsers.id });
    return updated.length > 0;
  }
}
