import { toast } from "sonner";
import { Forgot } from "@/components/screens/auth";
import { forgotPasswordFn } from "@/api/auth/auth.api";
import { getErrorMessage, successMessages } from "@/utils/feedback";

export function ForgotPage() {
  const handleSubmit = async (email: string): Promise<void> => {
    try {
      await forgotPasswordFn({ email, type: "forgot" });
      toast.success(successMessages.forgot);
    } catch (error) {
      toast.error(getErrorMessage(error, "Não foi possível enviar o e-mail."));
      throw error;
    }
  };

  return <Forgot onSubmit={handleSubmit} />;
}
