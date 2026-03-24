import { Link } from "react-router-dom";
import { ActionBar, Button } from "@/components/ui";

export function NotFoundScreen() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border px-4 py-4 sm:px-6">
        <ActionBar
          title="Página não encontrada"
          breadcrumb={[{ label: "Início", to: "/" }]}
          actions={
            <Button type="button" size="sm" asChild>
              <Link to="/">Ir ao login</Link>
            </Button>
          }
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <p className="text-5xl font-bold text-foreground">404</p>
        <p className="text-muted-foreground">A rota solicitada não existe.</p>
        <Button asChild>
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
}

NotFoundScreen.displayName = "NotFoundScreen";
