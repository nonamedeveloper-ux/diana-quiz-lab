'use strict';

const XLSX = require('xlsx');

/**
 * Export generated test variants to Excel.
 *
 * Sheet layout:
 *   "Variantlar"  — every variant as a block: header row + numbered question rows
 *   "Kalit"       — compact answer-key table (rows=variants, cols=question numbers)
 */
function exportTestToExcel(variants, testTitle, subjectName) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Variantlar ──────────────────────────────────────────────────
  const testRows = [];

  // Title row
  testRows.push([testTitle, '', '', '', '', '', '']);
  testRows.push([`Fan: ${subjectName}`, '', '', '', '', '', '']);
  testRows.push(['']); // blank

  for (const v of variants) {
    // Variant header
    testRows.push([`${v.variantNumber}-VARIANT`, '', '', '', '', '', '']);
    testRows.push(['#', 'Savol', 'A', 'B', 'C', 'D', 'To\'g\'ri javob']);

    const sorted = [...v.questions].sort((a, b) => a.position - b.position);
    for (const q of sorted) {
      testRows.push([
        q.position,
        q.questionText,
        q.shuffledA,
        q.shuffledB,
        q.shuffledC,
        q.shuffledD,
        q.correctAnswer,
      ]);
    }
    testRows.push(['']); // blank between variants
  }

  const ws1 = XLSX.utils.aoa_to_sheet(testRows);

  // Column widths
  ws1['!cols'] = [
    { wch: 4 },   // #
    { wch: 50 },  // Savol
    { wch: 22 },  // A
    { wch: 22 },  // B
    { wch: 22 },  // C
    { wch: 22 },  // D
    { wch: 12 },  // Javob
  ];

  // Style: bold title rows (limited styling via XLSX community edition)
  styleCell(ws1, 0, 0, { bold: true, sz: 14 });
  styleCell(ws1, 1, 0, { bold: true });

  XLSX.utils.book_append_sheet(wb, ws1, 'Variantlar');

  // ── Sheet 2: Kalit (Answer Key) ──────────────────────────────────────────
  const qCount = variants[0]?.questions?.length || 0;
  const keyRows = [];

  // Meta header
  keyRows.push([`JAVOBLAR KALITI — ${testTitle}`]);
  keyRows.push([`Fan: ${subjectName}   |   Variantlar: ${variants.length}   |   Savollar: ${qCount}`]);
  keyRows.push(['']);

  // Table header: Variant | 1 | 2 | 3 | ...
  keyRows.push(['Variant', ...Array.from({ length: qCount }, (_, i) => i + 1)]);

  for (const v of variants) {
    const sorted = [...v.questions].sort((a, b) => a.position - b.position);
    keyRows.push([v.variantNumber, ...sorted.map(q => q.correctAnswer)]);
  }

  const ws2 = XLSX.utils.aoa_to_sheet(keyRows);

  // Column widths for key sheet
  ws2['!cols'] = [
    { wch: 10 },
    ...Array.from({ length: qCount }, () => ({ wch: 5 })),
  ];

  XLSX.utils.book_append_sheet(wb, ws2, 'Kalit');

  // ── Sheet 3: Har variant alohida (first 5 for quick print) ──────────────
  const printRows = [];
  printRows.push([testTitle]);
  printRows.push([`Fan: ${subjectName}`]);
  printRows.push(['']);

  for (const v of variants.slice(0, 5)) {
    printRows.push([`${v.variantNumber}-VARIANT`]);
    const sorted = [...v.questions].sort((a, b) => a.position - b.position);
    for (const q of sorted) {
      printRows.push([`${q.position}.`, q.questionText]);
      printRows.push(['', `A) ${q.shuffledA}`]);
      printRows.push(['', `B) ${q.shuffledB}`]);
      printRows.push(['', `C) ${q.shuffledC}`]);
      printRows.push(['', `D) ${q.shuffledD}`]);
      printRows.push(['']);
    }
    printRows.push(['']);
  }

  const ws3 = XLSX.utils.aoa_to_sheet(printRows);
  ws3['!cols'] = [{ wch: 5 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Print (1-5)');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

// Minimal cell styling helper (works with xlsx community edition)
function styleCell(ws, row, col, fontProps) {
  const addr = XLSX.utils.encode_cell({ r: row, c: col });
  if (!ws[addr]) return;
  ws[addr].s = { font: fontProps };
}

module.exports = { exportTestToExcel };
