// =====================================================
// Statix — ExportButton
// Copiar el resumen en texto y descargar el informe en PDF.
// =====================================================
import { useState } from 'react';
import { Check, Copy, Download, Loader2 } from 'lucide-react';
import { exportToPdf, type PdfPayload } from '@/services/pdf.service';

interface ExportButtonProps {
  payload: PdfPayload;
  summary?: string;
  label?: string;
}

export function ExportButton({
  payload, summary, label = 'Descargar PDF',
}: ExportButtonProps) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* el portapapeles puede no estar disponible (http, permisos) */
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToPdf(payload);
    } catch (err) {
      console.error('No se pudo generar el PDF', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {summary && (
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-v0-150 bg-v0 px-3.5 text-[14px] font-medium text-v0-800 transition-colors hover:border-v0-300 active:scale-[0.98] dark:border-v0-800 dark:bg-v0-950 dark:text-v0-100 dark:hover:border-v0-600"
        >
          {copied ? <Check size={15} strokeWidth={2} aria-hidden="true" /> : <Copy size={15} strokeWidth={1.75} aria-hidden="true" />}
          <span aria-live="polite">{copied ? 'Copiado' : 'Copiar resumen'}</span>
        </button>
      )}
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md bg-v0-950 px-3.5 text-[14px] font-medium text-v0-50 transition-colors hover:bg-v0-800 active:scale-[0.98] disabled:opacity-60 dark:bg-v0-50 dark:text-v0-950 dark:hover:bg-v0-200"
      >
        {exporting ? (
          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
        ) : (
          <Download size={15} strokeWidth={1.75} aria-hidden="true" />
        )}
        {exporting ? 'Generando…' : label === 'Exportar' ? 'Descargar PDF' : label}
      </button>
    </div>
  );
}
