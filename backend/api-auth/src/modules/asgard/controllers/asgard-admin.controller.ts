import type { Request, Response } from "express";
import { z } from "zod";
import type { CreateAsgardUserService } from "@/modules/asgard/services/create-asgard-user.service.js";
import type { AsgardUserRepository } from "@/repositories/asgard-user.repository.js";

const bodySchema = z.object({
  name: z.string().min(1, "Informe o nome."),
  email: z.string().email("E-mail inválido."),
});

const patchStatusSchema = z.object({
  isActive: z.boolean(),
});

export class AsgardAdminController {
  constructor(
    private readonly createAsgardUserService: CreateAsgardUserService,
    private readonly asgardUserRepo: AsgardUserRepository
  ) {}

  createUser = async (req: Request, res: Response): Promise<void> => {
    const parsed = bodySchema.parse(req.body);
    const result = await this.createAsgardUserService.execute(parsed);
    res.status(201).json({
      success: true,
      data: result,
    });
  };

  listUsers = async (_req: Request, res: Response): Promise<void> => {
    const rows = await this.asgardUserRepo.listAll();
    res.status(200).json({
      success: true,
      data: rows,
    });
  };

  patchUserStatus = async (req: Request, res: Response): Promise<void> => {
    const id = z.string().uuid().parse(req.params.id);
    const parsed = patchStatusSchema.parse(req.body);
    const ok = await this.asgardUserRepo.setActiveById(id, parsed.isActive);
    if (!ok) {
      res.status(404).json({
        success: false,
        error: { message: "Usuário não encontrado." },
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: { ok: true },
    });
  };
}
