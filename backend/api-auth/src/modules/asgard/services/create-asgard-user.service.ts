import crypto from "node:crypto";
import { ConflictError } from "@/errors/app-error.js";
import { sendTokenEmail } from "@/infra/email.js";
import type { AsgardUserRepository } from "@/repositories/asgard-user.repository.js";
import type { UserRepository } from "@/repositories/user.repository.js";

const SUPER_ADMIN_DOMAIN = "@asgardai.com.br";
const TOKEN_TTL_MS = 60 * 60 * 1000;

export interface CreateAsgardUserServiceInput {
  name: string;
  email: string;
}

export class CreateAsgardUserService {
  constructor(
    private readonly asgardUserRepo: AsgardUserRepository,
    private readonly userRepo: UserRepository
  ) {}

  async execute(input: CreateAsgardUserServiceInput) {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();

    if (!email.endsWith(SUPER_ADMIN_DOMAIN)) {
      throw new ConflictError(`O e-mail deve ser do domínio ${SUPER_ADMIN_DOMAIN}.`);
    }

    const existing = await this.asgardUserRepo.findByEmail(email);
    if (existing) {
      throw new ConflictError("Já existe um utilizador com este e-mail.");
    }

    await this.asgardUserRepo.createInvitedUser({ name, email });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    await this.userRepo.savePasswordResetToken("master", email, token, expiresAt);
    await sendTokenEmail(email, token, "activation");

    return { ok: true as const, email };
  }
}
