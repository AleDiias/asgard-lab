import { useAuthStore } from "@/stores/auth.store";

export function AppHomePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Bem-vindo{user?.email ? `, ${user.email}` : ""}
        </h2>
        <p className="text-muted-foreground">
          Login efetuado com sucesso. Esta é a área protegida do CRM.
        </p>
      </div>
    </section>
  );
}
