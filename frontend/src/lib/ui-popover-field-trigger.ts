/**
 * Classes para `Button` usado como gatilho de Popover com aparência de campo (como `Input`).
 * Evita o aspeto “sempre ativo” do `Button variant="outline"` (borda/texto primários fixos).
 */
export const popoverFieldTriggerClassName =
  "rounded-[7px] border border-input bg-background font-normal text-foreground shadow-sm transition-colors " +
  "hover:bg-accent hover:text-accent-foreground " +
  "data-[state=open]:border-primary data-[state=open]:text-primary " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
