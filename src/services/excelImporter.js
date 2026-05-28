'use strict';

const XLSX = require('xlsx');
const prisma = require('../config/database');

const VALID_ANSWERS = new Set(['A', 'B', 'C', 'D']);
const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

function parseSheet(workbook) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  // header: true → array of objects keyed by row 1 values
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

function normalise(row) {
  const get = (...keys) => {
    for (const k of keys) {
      const v = row[k] || row[k.toLowerCase()] || row[k.toUpperCase()];
      if (v !== undefined && v !== '') return String(v).trim();
    }
    return '';
  };

  return {
    text: get('Question', 'Savol', 'question', 'QUESTION'),
    optionA: get('A', 'Option A', 'a'),
    optionB: get('B', 'Option B', 'b'),
    optionC: get('C', 'Option C', 'c'),
    optionD: get('D', 'Option D', 'd'),
    correctAnswer: get('Correct', 'correct', 'CORRECT', 'Answer', 'Javob').toUpperCase(),
    subjectName: get('Subject', 'Fan', 'subject'),
    difficulty: get('Difficulty', 'Qiyinlik', 'difficulty').toLowerCase() || 'medium',
  };
}

async function importFromFile(filePath, defaultSubjectId) {
  const workbook = XLSX.readFile(filePath);
  const rows = parseSheet(workbook);

  const results = { created: 0, skipped: 0, errors: [] };
  const subjectCache = new Map();

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // 1-indexed + header row
    try {
      const data = normalise(rows[i]);

      if (!data.text) { results.skipped++; continue; }
      if (!data.optionA || !data.optionB || !data.optionC || !data.optionD) {
        results.errors.push(`${rowNum}-qator: Variantlar to'liq emas`);
        continue;
      }
      if (!VALID_ANSWERS.has(data.correctAnswer)) {
        results.errors.push(`${rowNum}-qator: Noto'g'ri javob (${data.correctAnswer || 'bo\'sh'}). A/B/C/D bo'lishi kerak`);
        continue;
      }

      const difficulty = VALID_DIFFICULTIES.has(data.difficulty) ? data.difficulty : 'medium';

      let subjectId = defaultSubjectId;
      if (data.subjectName) {
        if (!subjectCache.has(data.subjectName)) {
          const subject = await prisma.subject.upsert({
            where: { name: data.subjectName },
            update: {},
            create: { name: data.subjectName },
          });
          subjectCache.set(data.subjectName, subject.id);
        }
        subjectId = subjectCache.get(data.subjectName);
      }

      if (!subjectId) {
        results.errors.push(`${rowNum}-qator: Fan ko'rsatilmagan`);
        continue;
      }

      await prisma.question.create({
        data: {
          subjectId,
          text: data.text,
          optionA: data.optionA,
          optionB: data.optionB,
          optionC: data.optionC,
          optionD: data.optionD,
          correctAnswer: data.correctAnswer,
          difficulty,
        },
      });
      results.created++;
    } catch (err) {
      results.errors.push(`${rowNum}-qator: ${err.message}`);
    }
  }

  return results;
}

function generateTemplate() {
  const headers = ['Question', 'A', 'B', 'C', 'D', 'Correct', 'Subject', 'Difficulty'];
  const sample = [
    ['2 + 2 = ?', '3', '4', '5', '6', 'B', 'Matematika', 'easy'],
    ["O'zbekiston poytaxti?", 'Samarqand', 'Toshkent', 'Buxoro', 'Namangan', 'B', 'Tarix', 'easy'],
    ['H₂O - bu nima?', 'Kislota', 'Suv', 'Tuz', 'Gaz', 'B', 'Kimyo', 'easy'],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
  ws['!cols'] = [
    { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
    { wch: 10 }, { wch: 15 }, { wch: 12 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Savollar');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = { importFromFile, generateTemplate };
