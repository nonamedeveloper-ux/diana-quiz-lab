'use strict';

const prisma = require('../config/database');
const { generateVariants } = require('../services/randomizer');
const { exportTestsToWord, exportAnswerKeyToWord } = require('../services/wordExporter');
const { exportTestToExcel } = require('../services/excelExporter');
const { setFlash } = require('../utils/helpers');

exports.showForm = async (req, res) => {
  const subjects = await prisma.subject.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { name: 'asc' },
  });
  res.render('generator/index', { title: "Test Yaratish", subjects });
};

exports.generate = async (req, res) => {
  const { subjectId, variantCount, questionsPerVariant, title } = req.body;
  const subId = parseInt(subjectId);
  const vCount = parseInt(variantCount);
  const qCount = parseInt(questionsPerVariant);

  if (!subId || isNaN(vCount) || isNaN(qCount)) {
    setFlash(req, 'error', "Barcha maydonlarni to'ldiring");
    return res.redirect('/generator');
  }
  if (vCount < 1 || vCount > 200) {
    setFlash(req, 'error', 'Variant soni 1-200 oralig\'ida bo\'lishi kerak');
    return res.redirect('/generator');
  }
  if (qCount < 1 || qCount > 100) {
    setFlash(req, 'error', 'Savol soni 1-100 oralig\'ida bo\'lishi kerak');
    return res.redirect('/generator');
  }

  try {
    const subject = await prisma.subject.findUnique({ where: { id: subId } });
    if (!subject) {
      setFlash(req, 'error', 'Fan topilmadi');
      return res.redirect('/generator');
    }

    const questions = await prisma.question.findMany({ where: { subjectId: subId } });
    if (questions.length < qCount) {
      setFlash(req, 'error',
        `Bu fanda yetarli savol yo'q. Mavjud: ${questions.length}, kerakli: ${qCount}`
      );
      return res.redirect('/generator');
    }

    const testTitle = title?.trim() || `${subject.name} - Test`;
    const variants = generateVariants(questions, vCount, qCount);

    // Save to database in a transaction
    const savedTest = await prisma.$transaction(async (tx) => {
      const test = await tx.generatedTest.create({
        data: {
          title: testTitle,
          subjectId: subId,
          totalVariants: vCount,
          questionsPerVariant: qCount,
        },
      });

      const rows = [];
      for (const v of variants) {
        for (const q of v.questions) {
          rows.push({
            testId: test.id,
            questionId: q.questionId,
            variantNumber: v.variantNumber,
            position: q.position,
            questionText: q.questionText,
            shuffledA: q.shuffledA,
            shuffledB: q.shuffledB,
            shuffledC: q.shuffledC,
            shuffledD: q.shuffledD,
            correctAnswer: q.correctAnswer,
          });
        }
      }

      await tx.generatedQuestion.createMany({ data: rows });
      return test;
    });

    res.redirect(`/generator/${savedTest.id}`);
  } catch (err) {
    console.error('Generate error:', err);
    setFlash(req, 'error', `Xato: ${err.message}`);
    res.redirect('/generator');
  }
};

exports.showResult = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const test = await prisma.generatedTest.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: { orderBy: [{ variantNumber: 'asc' }, { position: 'asc' }] },
      },
    });
    if (!test) return res.redirect('/generator/history');

    // Group questions by variant
    const variantsMap = new Map();
    for (const q of test.questions) {
      if (!variantsMap.has(q.variantNumber)) variantsMap.set(q.variantNumber, []);
      variantsMap.get(q.variantNumber).push(q);
    }
    const variants = Array.from(variantsMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([num, qs]) => ({ variantNumber: num, questions: qs }));

    res.render('generator/result', {
      title: `${test.title} - Natija`,
      test,
      variants,
      preview: variants[0] || null,
    });
  } catch (err) {
    console.error(err);
    res.redirect('/generator/history');
  }
};

exports.history = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const PAGE_SIZE = 10;
  const [total, tests] = await Promise.all([
    prisma.generatedTest.count(),
    prisma.generatedTest.findMany({
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  res.render('generator/history', {
    title: 'Test Tarixi',
    tests,
    page,
    totalPages,
    total,
  });
};

exports.deleteTest = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.generatedTest.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

exports.downloadTests = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const test = await prisma.generatedTest.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: { orderBy: [{ variantNumber: 'asc' }, { position: 'asc' }] },
      },
    });
    if (!test) return res.status(404).send('Topilmadi');

    const variantsMap = new Map();
    for (const q of test.questions) {
      if (!variantsMap.has(q.variantNumber)) variantsMap.set(q.variantNumber, []);
      variantsMap.get(q.variantNumber).push(q);
    }
    const variants = Array.from(variantsMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([num, qs]) => ({ variantNumber: num, questions: qs }));

    const buffer = await exportTestsToWord(variants, test.title, test.subject.name);
    const filename = encodeURIComponent(`${test.title}_Testlar.docx`);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (err) {
    console.error('Download tests error:', err);
    res.status(500).send('Yuklab olishda xato');
  }
};

exports.downloadKey = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const test = await prisma.generatedTest.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: { orderBy: [{ variantNumber: 'asc' }, { position: 'asc' }] },
      },
    });
    if (!test) return res.status(404).send('Topilmadi');

    const variantsMap = new Map();
    for (const q of test.questions) {
      if (!variantsMap.has(q.variantNumber)) variantsMap.set(q.variantNumber, []);
      variantsMap.get(q.variantNumber).push(q);
    }
    const variants = Array.from(variantsMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([num, qs]) => ({ variantNumber: num, questions: qs }));

    const buffer = await exportAnswerKeyToWord(variants, test.title, test.subject.name);
    const filename = encodeURIComponent(`${test.title}_Javoblar_Kaliti.docx`);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (err) {
    console.error('Download key error:', err);
    res.status(500).send('Yuklab olishda xato');
  }
};

exports.downloadExcel = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const test = await prisma.generatedTest.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: { orderBy: [{ variantNumber: 'asc' }, { position: 'asc' }] },
      },
    });
    if (!test) return res.status(404).send('Topilmadi');

    const variantsMap = new Map();
    for (const q of test.questions) {
      if (!variantsMap.has(q.variantNumber)) variantsMap.set(q.variantNumber, []);
      variantsMap.get(q.variantNumber).push(q);
    }
    const variants = Array.from(variantsMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([num, qs]) => ({ variantNumber: num, questions: qs }));

    const buffer = exportTestToExcel(variants, test.title, test.subject.name);
    const filename = encodeURIComponent(`${test.title}_Test.xlsx`);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Download excel error:', err);
    res.status(500).send('Yuklab olishda xato');
  }
};
