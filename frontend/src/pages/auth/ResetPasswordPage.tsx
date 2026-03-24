import { toast } from "sonner";
import { ResetPassword } from "@/components/screens/auth";
import { resetPasswordFn } from "@/api/auth/auth.api";
import { getErrorMessage, successMessages } from "@/utils/feedback";

export function ResetPasswordPage() {
  const handleSubmit = async (data: { token: string; newPassword: string }) => {
    try {
      const result = await resetPasswordFn(data);
      toast.success(result.message ?? successMessages.resetPassword);
    } catch (error) {
      toast.error(getErrorMessage(error, "Não foi possível redefinir a senha."));
    }
  };

  return <ResetPassword onSubmit={handleSubmit} />;
}
