import type { Response } from "express";
import type { RequestWithTenant } from "@/middlewares/require-tenant-domain.middleware.js";
import { AuthenticateUserService } from "@/services/authenticate-user.service.js";
import { ForgotPasswordService } from "@/services/forgot-password.service.js";
import { ResetPasswordService } from "@/services/reset-password.service.js";

export class AuthController {
  constructor(
    private readonly authenticateService: AuthenticateUserService,
    private readonly forgotPasswordService: ForgotPasswordService,
    private readonly resetPasswordService: ResetPasswordService
  ) {}

  login = async (req: RequestWithTenant, res: Response): Promise<void> => {
    const { email, password } = req.body as { email: string; password: string };
    const tenantDomain = req.tenantDomain!;
    const result = await this.authenticateService.execute({
      email,
      password,
      tenantDomain,
    });
    res.status(200).json({ success: true, data: result });
  };

  forgotPassword = async (
    req: RequestWithTenant,
    res: Response
  ): Promise<void> => {
    const { email, type } = req.body as { email: string; type?: "forgot" | "activation" };
    const tenantDomain = req.tenantDomain!;
    await this.forgotPasswordService.execute({ email, tenantDomain, type });
    const isActivation = type === "activation";
    res.status(200).json({
      success: true,
      data: {
        message: isActivation
          ? "Se o e-mail existir, você receberá um link para ativar a conta e definir a senha."
          : "Se o e-mail existir, você receberá um link para redefinir a senha.",
      },
    });
  };

  resetPassword = async (
    req: RequestWithTenant,
    res: Response
  ): Promise<void> => {
    const { token, newPassword } = req.body as {
      token: string;
      newPassword: string;
    };
    const tenantDomain = req.tenantDomain!;
    await this.resetPasswordService.execute({
      token,
      newPassword,
      tenantDomain,
    });
    res.status(200).json({
      success: true,
      data: { message: "Senha redefinida com sucesso." },
    });
  };
}
