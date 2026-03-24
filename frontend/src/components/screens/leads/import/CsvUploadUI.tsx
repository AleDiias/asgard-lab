import { useCallback, useRef, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export interface CsvUploadUIProps {
  disabled?: boolean;
  onFileSelected: (file: File) => void;
  /** Chamado quando o arquivo não é `.csv`. */
  onInvalidFile?: () => void;
  /** Erro de validação vindo do container (ex.: Zod). */
  error?: string;
  className?: string;
}

export function CsvUploadUI({
  disabled,
  onFileSelected,
  onInvalidFile,
  error,
  className,
}: CsvUploadUIProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file || disabled) return;
      const name = file.name.toLowerCase();
      if (!name.endsWith(".csv")) {
        onInvalidFile?.();
        return;
      }
      onFileSelected(file);
    },
    [disabled, onFileSelected, onInvalidFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      handleFile(f);
    },
    [handleFile]
  );

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base">Arquivo CSV</CardTitle>
        <CardDescription>
          Arraste o arquivo para aqui ou clique para selecionar. Apenas arquivos{" "}
          <span className="font-medium">.csv</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-8 text-center transition-colors",
            dragOver && "border-primary bg-primary/5",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <FileSpreadsheet className="h-10 w-10 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Arraste o arquivo CSV aqui ou use o botão abaixo
          </p>
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Escolher arquivo
          </Button>
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
