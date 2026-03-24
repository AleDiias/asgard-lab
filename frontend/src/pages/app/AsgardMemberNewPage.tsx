import { useCallback, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { isAxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ActionBar, Button, FormPageShell } from "@/components/ui";
import {
  ASGARD_USERS_ROUTES,
  AsgardUserFormUI,
  asgardUserFormUiDefaultLabels,
  asgardUsersScreen,
  type AsgardUserFormFieldErrors,
  type AsgardUserFormValues,
} from "@/components/screens/asgard-users";
import {
  asgardUserFormSchema,
  mapZodErrorToAsgardUserFormFieldErrors,
} from "@/pages/app/schemas/asgard-user-form.schema";
import { createAsgardUserFn } from "@/api/admin/admin.api";
import { getErrorMessage, successMessages } from "@/utils/feedback";

const ASGARD_MEMBER_NEW_FORM_ID = "asgard-member-new-form";

export default function AsgardMemberNewPage() {
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState<AsgardUserFormFieldErrors | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: AsgardUserFormValues) => {
      const parsed = asgardUserFormSchema.safeParse(data);
      if (!parsed.success) {
        setFieldErrors(mapZodErrorToAsgardUserFormFieldErrors(parsed.error));
        return;
      }
      setFieldErrors(undefined);
      setIsLoading(true);
      try {
        const result = await createAsgardUserFn({
          name: parsed.data.name.trim(),
          email: parsed.data.email.trim().toLowerCase(),
        });
        toast.success(successMessages.inviteSent(result.email));
        navigate(ASGARD_USERS_ROUTES.list);
      } catch (error: unknown) {
        if (isAxiosError(error) && error.response?.status === 409) {
          setFieldErrors({
            email: getErrorMessage(error, "Este e-mail já está em uso."),
          });
          return;
        }
        toast.error(getErrorMessage(error, "Não foi possível enviar o convite."));
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <ActionBar
        title={asgardUsersScreen.newMember.title}
        breadcrumb={[...asgardUsersScreen.newMember.breadcrumb]}
        actions={
          <>
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" asChild>
              <Link to={ASGARD_USERS_ROUTES.list} aria-label="Voltar à lista">
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button type="submit" form={ASGARD_MEMBER_NEW_FORM_ID} size="sm" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  {asgardUserFormUiDefaultLabels.submit}
                </>
              ) : (
                asgardUserFormUiDefaultLabels.submit
              )}
            </Button>
          </>
        }
      />
      <FormPageShell maxWidth="wide" fullWidth>
        <AsgardUserFormUI
          formId={ASGARD_MEMBER_NEW_FORM_ID}
          hideSubmitButton
          fieldErrors={fieldErrors}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          hideTitle
        />
      </FormPageShell>
    </section>
  );
}
