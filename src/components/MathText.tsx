// =====================================================
// Statix — MathText
// -----------------------------------------------------
// Renderiza texto que mezcla prosa con matemática en línea.
// Convenciones admitidas dentro de las cadenas de teoría:
//   $...$      → fórmula en línea (KaTeX)
//   **texto**  → negrita
// =====================================================
import { Fragment, type ReactNode } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  children: string;
  className?: string;
}

/** Renderiza una fórmula KaTeX en línea como HTML seguro. */
function inlineMath(latex: string, key: number): ReactNode {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: false,
    output: 'html',
    strict: 'ignore',
  });
  return (
    <span
      key={`m-${key}`}
      // KaTeX genera el HTML a partir de contenido estático y controlado.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Procesa **negrita** dentro de un segmento de texto plano. */
function withBold(text: string, baseKey: number): ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  // split con grupo: índices impares son el contenido en negrita
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`b-${baseKey}-${i}`} className="font-semibold text-v0-900 dark:text-v0-100">
        {part}
      </strong>
    ) : (
      <Fragment key={`t-${baseKey}-${i}`}>{part}</Fragment>
    ),
  );
}

export function MathText({ children, className }: MathTextProps) {
  // Separa el texto en segmentos de prosa y de matemática ($...$).
  const segments = children.split(/\$([^$]+)\$/g);
  const nodes = segments.map((seg, i) =>
    i % 2 === 1 ? inlineMath(seg, i) : <Fragment key={`s-${i}`}>{withBold(seg, i)}</Fragment>,
  );
  return <span className={className}>{nodes}</span>;
}
