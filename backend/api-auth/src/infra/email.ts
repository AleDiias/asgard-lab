import nodemailer from "nodemailer";
import { logger } from "./logger.js";

const SMTP_HOST = process.env.SMTP_HOST ?? "";
const SMTP_PORT = Number(process.env.SMTP_PORT) ?? 587;
const SMTP_USER = process.env.SMTP_USER ?? "";
const SMTP_PASS = process.env.SMTP_PASS ?? "";
const SMTP_FROM = process.env.SMTP_FROM ?? SMTP_USER;
const FRONTEND_URL = (process.env.FRONTEND_URL ?? "http://localhost:3005").replace(
  /\/$/,
  ""
);
/**
 * Opcional: template para links de tenant (ex.: https://{tenant}.asgardai.com.br).
 * Se ausente, tenta derivar a partir de FRONTEND_URL substituindo apenas o subdomínio.
 */
const FRONTEND_TENANT_URL_TEMPLATE = process.env.FRONTEND_TENANT_URL_TEMPLATE ?? "";
/** URL absoluta do logo nos e-mails (ex.: mesmo domínio do app em `/asgard-logo.png`). */
const EMAIL_LOGO_URL = (process.env.EMAIL_LOGO_URL ?? `${FRONTEND_URL}/asgard-logo.png`).replace(
  /\/$/,
  ""
);

export type TokenEmailType = "forgot" | "activation";

function resolveFrontendUrl(tenantDomain?: string): string {
  if (!tenantDomain || !tenantDomain.trim()) {
    return FRONTEND_URL;
  }
  const domain = tenantDomain.trim().toLowerCase();

  if (FRONTEND_TENANT_URL_TEMPLATE.includes("{tenant}")) {
    return FRONTEND_TENANT_URL_TEMPLATE.replace("{tenant}", domain).replace(/\/$/, "");
  }

  try {
    const url = new URL(FRONTEND_URL);
    const labels = url.hostname.split(".");
    // Ex.: blackbox.asgardai.com.br -> tenant.asgardai.com.br
    if (labels.length >= 3) {
      labels[0] = domain;
      url.hostname = labels.join(".");
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    // Fallback para FRONTEND_URL base se parsing falhar.
  }
  return FRONTEND_URL;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Layout HTML compatível com clientes de e-mail (tabelas + estilos inline).
 */
function buildBrandedEmailHtml(params: {
  title: string;
  intro: string;
  ctaLabel: string;
  resetLink: string;
  recipientEmail: string;
  typeLabel: string;
}): string {
  const { title, intro, ctaLabel, resetLink, recipientEmail, typeLabel } = params;
  const safeLink = escapeHtml(resetLink);
  const safeEmail = escapeHtml(recipientEmail);
  const logoSrc = escapeHtml(EMAIL_LOGO_URL);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.5;color:#18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;box-shadow:0 4px 6px -1px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:28px 28px 20px;text-align:center;border-bottom:1px solid #f4f4f5;">
              <img src="${logoSrc}" alt="AsgardLAB" width="160" height="auto" style="display:block;margin:0 auto;max-width:160px;height:auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 8px;">
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#18181b;">${escapeHtml(title)}</h1>
              <p style="margin:0 0 16px;color:#52525b;">${intro}</p>
              <table role="presentation" style="width:100%;background:#fafafa;border-radius:8px;border:1px solid #e4e4e7;margin-bottom:20px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:13px;color:#52525b;">
                      <tr>
                        <td style="padding:4px 0;vertical-align:top;width:100px;color:#71717a;">Conta</td>
                        <td style="padding:4px 0;font-weight:500;color:#18181b;">${safeEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;vertical-align:top;color:#71717a;">Tipo</td>
                        <td style="padding:4px 0;">${escapeHtml(typeLabel)}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;vertical-align:top;color:#71717a;">Validade do link</td>
                        <td style="padding:4px 0;">1 hora após o envio</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="border-radius:8px;background:linear-gradient(180deg,#2563eb 0%,#1d4ed8 100%);">
                    <a href="${safeLink}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(ctaLabel)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:12px;color:#71717a;">Se o botão não funcionar, copie e cole este endereço no navegador:</p>
              <p style="margin:0 0 20px;font-size:11px;word-break:break-all;color:#3f3f46;background:#fafafa;padding:10px 12px;border-radius:6px;border:1px solid #e4e4e7;">${safeLink}</p>
              <p style="margin:0;font-size:12px;color:#a1a1aa;">Por segurança, não encaminhe este e-mail. Se você não solicitou esta ação, ignore esta mensagem.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;background:#fafafa;border-top:1px solid #f4f4f5;text-align:center;font-size:11px;color:#a1a1aa;">
              © ${new Date().getFullYear()} AsgardLAB · E-mail automático · Não responda a esta mensagem.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getSubjectAndBody(
  type: TokenEmailType,
  resetLink: string,
  recipientEmail: string
): { subject: string; text: string; html: string } {
  const typeLabel = type === "activation" ? "Ativação de conta / primeira senha" : "Redefinição de senha";

  if (type === "activation") {
    const subject = "Ative sua conta AsgardLAB — defina sua senha";
    const title = "Ative sua conta";
    const intro =
      "Você está recebendo este e-mail porque há uma conta Asgard associada a este endereço. Use o botão abaixo para definir sua senha e concluir a ativação.";
    const ctaLabel = "Definir minha senha";
    const text = `${title}

${intro}

Conta: ${recipientEmail}
Tipo: ${typeLabel}
Link válido por: 1 hora

Acesse o link:
${resetLink}

---
© AsgardLAB · E-mail automático`;

    const html = buildBrandedEmailHtml({
      title,
      intro,
      ctaLabel,
      resetLink,
      recipientEmail,
      typeLabel,
    });

    return { subject, text, html };
  }

  const subject = "Redefinição de senha — AsgardLAB";
  const title = "Redefinir sua senha";
  const intro =
    "Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.";
  const ctaLabel = "Redefinir senha";
  const text = `${title}

${intro}

Conta: ${recipientEmail}
Tipo: ${typeLabel}
Link válido por: 1 hora

Acesse o link:
${resetLink}

---
© AsgardLAB · E-mail automático`;

  const html = buildBrandedEmailHtml({
    title,
    intro,
    ctaLabel,
    resetLink,
    recipientEmail,
    typeLabel,
  });

  return { subject, text, html };
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logger.warn("SMTP não configurado (SMTP_HOST/USER/PASS). E-mails não serão enviados.");
    return null;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export async function sendTokenEmail(
  to: string,
  token: string,
  type: TokenEmailType,
  options?: { tenantDomain?: string }
): Promise<void> {
  const frontendUrl = resolveFrontendUrl(options?.tenantDomain);
  const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const { subject, text, html } = getSubjectAndBody(type, resetLink, to);

  const transport = getTransporter();
  if (!transport) {
    logger.info("E-mail não enviado (SMTP ausente)", { to, type, resetLink });
    return;
  }

  try {
    await transport.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text,
      html,
    });
    logger.info("E-mail enviado", { to, type });
  } catch (err) {
    logger.error("Falha ao enviar e-mail", {
      to,
      type,
      error: err instanceof Error ? err.message : String(err),
    });
    throw new Error("Não foi possível enviar o e-mail. Tente novamente mais tarde.");
  }
}
