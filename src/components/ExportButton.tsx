// =====================================================
// Statix — ExportButton (Vercel-style)
// =====================================================
import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { exportToPdf, type PdfPayload } from '@/services/pdf.service';

interface ExportButtonProps {
  payload: PdfPayload;
  summary?: string;
  label?: string;
}

export function ExportButton({
  payload, summary, label = 'Export',
}: ExportButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="flex items-center gap-2">
      {summary && (
        <button
          type="button"
          onClick={handleCopy}
          className="group inline-flex h-10 items-center gap-2 rounded-md border border-v0-200/30 bg-v0-50 px-3.5 text-[13px] font-medium text-v0-800 transition-all duration-200 hover:border-v0-300/60 hover:bg-v0-50 active:scale-[0.98] dark:border-v0-700/30 dark:bg-transparent dark:text-v0-100 dark:hover:border-v0-600 dark:hover:bg-v0-800/50"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <Check size={12} strokeWidth={2.4} className="text-emerald-500" />
                Copied
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <Copy size={12} strokeWidth={1.75} />
                Copy
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      )}
      <button
        type="button"
        onClick={() => exportToPdf(payload)}
        className="group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-md bg-v0-950 px-3.5 text-[13px] font-medium text-v0-50 transition-all duration-200 hover:bg-v0-800 hover:shadow-soft active:scale-[0.98] active:bg-v0-900 dark:bg-v0-50 dark:text-v0-950 dark:hover:bg-v0-200 dark:active:bg-v0-300"
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full dark:via-black/10" />
        <Download size={12} strokeWidth={1.75} className="relative" />
        <span className="relative">{label}</span>
      </button>
    </div>
  );
}
