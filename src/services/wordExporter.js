'use strict';

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} = require('docx');

const { buildAnswerKey } = require('./randomizer');

// ─── helpers ───────────────────────────────────────────────────────────────

function bold(text, size = 24) {
  return new TextRun({ text, bold: true, size });
}

function regular(text, size = 22) {
  return new TextRun({ text, size });
}

function heading(text, level = HeadingLevel.HEADING_2, align = AlignmentType.LEFT) {
  return new Paragraph({
    text,
    heading: level,
    alignment: align,
    spacing: { before: 200, after: 100 },
  });
}

function emptyLine() {
  return new Paragraph({ text: '' });
}

function cell(text, opts = {}) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: opts.bold || false, size: opts.size || 20 })],
        alignment: opts.align || AlignmentType.CENTER,
      }),
    ],
    shading: opts.shading ? { fill: 'D6E4F0', type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
  });
}

// ─── TEST DOCUMENT ─────────────────────────────────────────────────────────

async function exportTestsToWord(variants, testTitle, subjectName) {
  const children = [];

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];

    if (i > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    // Variant header
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({ text: `${testTitle}`, bold: true, size: 28, allCaps: true }),
        ],
      })
    );
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `Fan: ${subjectName}`, size: 24 }),
          new TextRun({ text: `     |     `, size: 24 }),
          new TextRun({ text: `${v.variantNumber}-VARIANT`, bold: true, size: 26 }),
        ],
      })
    );
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: `F.I.O: ____________________________`, size: 22 }),
          new TextRun({ text: `    Sana: _____________`, size: 22 }),
        ],
      })
    );

    // Questions
    const sorted = v.questions.sort((a, b) => a.position - b.position);
    for (const q of sorted) {
      children.push(
        new Paragraph({
          spacing: { before: 160, after: 60 },
          children: [bold(`${q.position}. ${q.questionText}`, 23)],
        })
      );
      const opts = [
        ['A', q.shuffledA],
        ['B', q.shuffledB],
        ['C', q.shuffledC],
        ['D', q.shuffledD],
      ];
      for (const [letter, text] of opts) {
        children.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: `${letter}) `, bold: true, size: 22 }),
              new TextRun({ text, size: 22 }),
            ],
          })
        );
      }
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

// ─── ANSWER KEY DOCUMENT ───────────────────────────────────────────────────

async function exportAnswerKeyToWord(variants, testTitle, subjectName) {
  const children = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [bold('JAVOBLAR KALITI', 30)],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: `${testTitle}`, size: 24 }),
        new TextRun({ text: `   |   Fan: ${subjectName}`, size: 24 }),
      ],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Variantlar: ${variants.length}   |   Savollar: ${variants[0]?.questions?.length || 0}`,
          size: 22,
          color: '555555',
        }),
      ],
    })
  );

  // Build compact table: rows = variants, cols = question numbers
  const qCount = variants[0]?.questions?.length || 0;

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      cell('Variant', { bold: true, shading: true }),
      ...Array.from({ length: qCount }, (_, i) =>
        cell(String(i + 1), { bold: true, shading: true })
      ),
    ],
  });

  const dataRows = variants.map(v => {
    const sorted = [...v.questions].sort((a, b) => a.position - b.position);
    return new TableRow({
      children: [
        cell(`${v.variantNumber}`, { bold: true }),
        ...sorted.map(q => cell(q.correctAnswer)),
      ],
    });
  });

  // If too many questions, use paragraph style instead of table
  if (qCount <= 30) {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
      })
    );
  } else {
    // Paragraph format for large tests
    for (const v of variants) {
      const key = buildAnswerKey(v.questions);
      const chunks = [];
      for (let i = 0; i < key.length; i += 10) {
        chunks.push(key.slice(i, i + 10).join('  '));
      }
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 60 },
          children: [bold(`${v.variantNumber}-VARIANT:`, 22)],
        })
      );
      for (const chunk of chunks) {
        children.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            indent: { left: 360 },
            children: [regular(chunk, 22)],
          })
        );
      }
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

module.exports = { exportTestsToWord, exportAnswerKeyToWord };
