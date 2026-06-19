// =====================================================
// Statix - Servicio de exportación a PDF
// =====================================================
import jsPDF from 'jspdf';

export interface PdfSection {
  title: string;
  content: string[];
}

export interface PdfPayload {
  documentTitle: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
  sections: PdfSection[];
}

/**
 * Genera un PDF simple a partir de texto estructurado. Mantiene el diseño
 * minimalista: cabecera con color de marca, tipografía sans, separadores
 * sutiles y un pie de página con la fecha.
 */
export function exportToPdf(payload: PdfPayload): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  // ---------- Cabecera ----------
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 64, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Statix', margin, 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Calculadora Profesional de Estadística y Probabilidad', margin, 50);
  y = 96;

  // ---------- Título del documento ----------
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(payload.documentTitle, margin, y);
  y += 22;

  if (payload.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(payload.subtitle, margin, y);
    y += 18;
  }

  // ---------- Meta ----------
  if (payload.meta && payload.meta.length > 0) {
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;
    doc.setFontSize(10);
    for (const m of payload.meta) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(`${m.label}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(m.value, margin + 110, y);
      y += 14;
    }
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;
  }

  // ---------- Secciones ----------
  for (const section of payload.sections) {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(section.title, margin, y);
    y += 16;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    for (const line of section.content) {
      const wrapped = doc.splitTextToSize(line, pageWidth - margin * 2);
      if (y + wrapped.length * 12 > pageHeight - 60) {
        doc.addPage();
        y = margin;
      }
      doc.text(wrapped, margin, y);
      y += wrapped.length * 12 + 2;
    }
    y += 10;
  }

  // ---------- Pie ----------
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generado por Statix - ${new Date().toLocaleString('es-ES')}`,
      margin,
      pageHeight - 24,
    );
    doc.text(
      `Página ${i} de ${total}`,
      pageWidth - margin,
      pageHeight - 24,
      { align: 'right' },
    );
  }

  doc.save(`${slugify(payload.documentTitle)}.pdf`);
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
