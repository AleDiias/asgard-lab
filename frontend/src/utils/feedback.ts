import { isAxiosError } from "axios";

export const successMessages = {
  login: "Login realizado com sucesso.",
  forgot: "Se o e-mail existir, você receberá o link para redefinir a senha.",
  resetPassword: "Senha redefinida com sucesso.",
  inviteSent: (email: string) => `Convite enviado com sucesso para ${email}`,
} as const;

const statusMessageMap: Record<number, string> = {
  400: "Não foi possível processar a solicitação.",
  401: "Credenciais inválidas.",
  403: "Acesso negado.",
  404: "Recurso não encontrado.",
  409: "Conflito: o recurso já existe ou está em uso.",
  429: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  500: "Erro interno do servidor. Tente novamente em instantes.",
  503: "Serviço temporariamente indisponível. Tente novamente mais tarde.",
};

export function getErrorMessage(error: unknown, fallback = "Ocorreu um erro inesperado."): string {
  if (isAxiosError<{ error?: { message?: string } }>(error)) {
    const status = error.response?.status;
    const apiMessage = error.response?.data?.error?.message;
    /** Prioriza a mensagem da API (ex.: credenciais vs. primeiro acesso) em vez do mapa genérico por status. */
    if (typeof apiMessage === "string" && apiMessage.trim()) return apiMessage;
    if (status && statusMessageMap[status]) return statusMessageMap[status];
    /** Axios devolve "Request failed with status code 429" sem corpo útil em alguns proxies. */
    const raw = typeof error.message === "string" ? error.message : "";
    if (/\b429\b/.test(raw)) return statusMessageMap[429];
    if (raw.trim()) return raw;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
