import { useCallback, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  ActionBar,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StepperProgressUI,
} from "@/components/ui";
import {
  ColumnMappingUI,
  CsvUploadUI,
  COLUMN_MAP_NONE,
  defaultColumnMapping,
  type ColumnMappingState,
} from "@/components/screens/leads/import";
import { importLeadsBulkFn } from "@/api/core/leads.api";
import type { LeadBulkRowPayload } from "@/types/core-leads.types";
import {
  LEAD_IMPORT_STEP_IDS,
  leadImportStepFileSchema,
  leadImportStepMappingSchema,
} from "@/schemas/lead-import-wizard.schema";

const STEPS = [
  { id: LEAD_IMPORT_STEP_IDS[0], title: "Arquivo" },
  { id: LEAD_IMPORT_STEP_IDS[1], title: "Mapeamento" },
  { id: LEAD_IMPORT_STEP_IDS[2], title: "Importando" },
] as const;

function buildMappedRows(
  dataRows: Record<string, unknown>[],
  mapping: ColumnMappingState
): LeadBulkRowPayload[] {
  const list: LeadBulkRowPayload[] = [];
  for (const row of dataRows) {
    const name = String(row[mapping.name] ?? "").trim();
    const phone = String(row[mapping.phone] ?? "").trim();
    let email: string | undefined;
    if (mapping.email !== COLUMN_MAP_NONE) {
      const e = String(row[mapping.email] ?? "").trim();
      if (e) email = e;
    }
    list.push({
      name,
      phone,
      email,
      status: "novo",
    });
  }
  return list;
}

export default function LeadImportPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<ColumnMappingState>(() => defaultColumnMapping());
  const [batchSize, setBatchSize] = useState(0);
  const [stepErrors, setStepErrors] = useState<Partial<Record<string, string>>>({});

  const resetWizard = useCallback(() => {
    setStepIndex(0);
    setFileName(null);
    setHeaders([]);
    setRows([]);
    setMapping(defaultColumnMapping());
    setBatchSize(0);
    setStepErrors({});
  }, []);

  const importMutation = useMutation({
    mutationFn: (payload: { leads: LeadBulkRowPayload[]; fileName?: string }) =>
      importLeadsBulkFn(payload.leads, { fileName: payload.fileName }),
    onSuccess: (data) => {
      const parts = [
        `${data.imported} importados`,
        `${data.duplicatesSkipped} duplicados ignorados`,
      ];
      if (data.invalidSkipped > 0) {
        parts.push(`${data.invalidSkipped} linhas inválidas (servidor)`);
      }
      toast.success("Importação concluída", {
        description: parts.join(" · "),
      });
      resetWizard();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Falha ao importar.");
      setStepErrors((e) => ({ ...e, import: err.message || "Falha ao importar." }));
    },
  });

  const clearErrorForStep = useCallback((id: string) => {
    setStepErrors((e) => {
      const next = { ...e };
      delete next[id];
      return next;
    });
  }, []);

  const handleStepperChange = useCallback((index: number) => {
    setStepIndex(index);
    setStepErrors({});
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const fileParsed = leadImportStepFileSchema.safeParse({ fileName: file.name });
      if (!fileParsed.success) {
        const msg =
          fileParsed.error.flatten().fieldErrors.fileName?.[0] ?? "Arquivo inválido.";
        setStepErrors({ [LEAD_IMPORT_STEP_IDS[0]]: msg });
        return;
      }

      setFileName(file.name);
      clearErrorForStep(LEAD_IMPORT_STEP_IDS[0]);

      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: "greedy",
        complete: (results) => {
          const fields = (results.meta.fields ?? []).filter(
            (f): f is string => typeof f === "string" && f.trim().length > 0
          );
          if (fields.length === 0) {
            setStepErrors({
              [LEAD_IMPORT_STEP_IDS[0]]: "O CSV não tem cabeçalhos na primeira linha.",
            });
            toast.error("O CSV não tem cabeçalhos na primeira linha.");
            return;
          }
          const data = Array.isArray(results.data) ? results.data : [];
          setHeaders(fields);
          setRows(data);
          setMapping(defaultColumnMapping());
          setStepIndex(1);
          setStepErrors({});
        },
        error: () => {
          toast.error("Não foi possível ler o arquivo CSV.");
          setStepErrors({ [LEAD_IMPORT_STEP_IDS[0]]: "Não foi possível ler o arquivo CSV." });
        },
      });
    },
    [clearErrorForStep]
  );

  const canProceedFromMapping = useMemo(() => {
    return (
      mapping.name !== COLUMN_MAP_NONE &&
      mapping.phone !== COLUMN_MAP_NONE &&
      mapping.name.trim() !== "" &&
      mapping.phone.trim() !== ""
    );
  }, [mapping]);

  const goImport = useCallback(() => {
    const m = leadImportStepMappingSchema.safeParse({
      nameColumn: mapping.name,
      phoneColumn: mapping.phone,
    });
    if (!m.success) {
      const fe = m.error.flatten().fieldErrors;
      const msg =
        [...(fe.nameColumn ?? []), ...(fe.phoneColumn ?? [])][0] ?? "Verifique o mapeamento.";
      setStepErrors({ [LEAD_IMPORT_STEP_IDS[1]]: msg });
      return;
    }

    const mapped = buildMappedRows(rows, mapping);
    const forApi = mapped.filter((r) => r.name.length > 0 && r.phone.length > 0);
    const dropped = mapped.length - forApi.length;
    if (forApi.length === 0) {
      setStepErrors({
        [LEAD_IMPORT_STEP_IDS[1]]: "Nenhuma linha com nome e telefone preenchidos.",
      });
      return;
    }
    if (dropped > 0) {
      toast.message(`${dropped} linha(s) sem nome/telefone serão ignoradas.`, {
        description: "Apenas linhas preenchidas são enviadas à API.",
      });
    }
    setStepErrors({});
    setBatchSize(forApi.length);
    setStepIndex(2);
    importMutation.mutate({
      leads: forApi,
      fileName: fileName ?? undefined,
    });
  }, [mapping, rows, importMutation, fileName]);

  const fileStepError = stepErrors[LEAD_IMPORT_STEP_IDS[0]];
  const mappingStepError = stepErrors[LEAD_IMPORT_STEP_IDS[1]];
  const importStepError = stepErrors[LEAD_IMPORT_STEP_IDS[2]];

  return (
    <section className="space-y-6">
      <ActionBar
        title="Importar Leads"
        breadcrumb={[
          { label: "Início", to: "/app" },
          { label: "Importar Leads" },
        ]}
      />

      <StepperProgressUI
        steps={[...STEPS]}
        value={stepIndex}
        onValueChange={handleStepperChange}
        stepErrors={{
          [LEAD_IMPORT_STEP_IDS[0]]: fileStepError,
          [LEAD_IMPORT_STEP_IDS[1]]: mappingStepError,
          [LEAD_IMPORT_STEP_IDS[2]]: importStepError,
        }}
      />

      {stepIndex === 0 && (
        <CsvUploadUI
          onFileSelected={handleFile}
          onInvalidFile={() => {
            setStepErrors({
              [LEAD_IMPORT_STEP_IDS[0]]: "Use um arquivo com extensão .csv.",
            });
            toast.error("Use um arquivo com extensão .csv.");
          }}
          error={fileStepError}
        />
      )}

      {stepIndex === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mapeamento de colunas</CardTitle>
              <CardDescription>
                Arquivo CSV: <span className="font-medium text-foreground">{fileName}</span> ·{" "}
                {rows.length} linha(s) de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColumnMappingUI
                headers={headers}
                mapping={mapping}
                onMappingChange={(next) => {
                  setMapping(next);
                  if (mappingStepError) clearErrorForStep(LEAD_IMPORT_STEP_IDS[1]);
                }}
                error={mappingStepError}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setStepIndex(0)}>
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                  Voltar
                </Button>
                <Button type="button" onClick={goImport} disabled={!canProceedFromMapping}>
                  Continuar e importar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {stepIndex === 2 && (
        <Card>
          <CardContent className="flex flex-col gap-3 py-10">
            {importMutation.isPending ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 shrink-0 animate-spin text-muted-foreground" />
                <div>
                  <p className="font-medium">A importar {batchSize} leads…</p>
                  <p className="text-sm text-muted-foreground">Aguarde a resposta da API.</p>
                </div>
              </div>
            ) : importStepError ? (
              <p className="text-sm text-destructive" role="alert">
                {importStepError}
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
