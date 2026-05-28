'use strict';

const path = require('path');
const fs = require('fs').promises;
const prisma = require('../config/database');
const { paginate } = require('../utils/helpers');
const { importFromFile, generateTemplate } = require('../services/excelImporter');

const PAGE_SIZE = 15;

exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search?.trim() || '';
    const subjectId = parseInt(req.query.subject) || undefined;
    const difficulty = req.query.difficulty || undefined;

    const where = {
      ...(search && { text: { contains: search } }),
      ...(subjectId && { subjectId }),
      ...(difficulty && { difficulty }),
    };

    const [total, questions, subjects] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        include: { subject: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.subject.findMany({ orderBy: { name: 'asc' } }),
    ]);

    const pagination = paginate(total, page, PAGE_SIZE);

    res.render('questions/index', {
      title: 'Savollar',
      questions,
      subjects,
      pagination,
      filters: { search, subjectId, difficulty },
    });
  } catch (err) {
    console.error(err);
    res.render('error', { title: 'Xato', message: 'Server xatosi', code: 500 });
  }
};

exports.create = async (req, res) => {
  const { subjectId, text, optionA, optionB, optionC, optionD, correctAnswer, difficulty } = req.body;
  if (!subjectId || !text || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
    return res.status(400).json({ success: false, message: "Barcha maydonlar to'ldirilishi shart" });
  }
  if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
    return res.status(400).json({ success: false, message: "Javob A, B, C yoki D bo'lishi kerak" });
  }
  try {
    const question = await prisma.question.create({
      data: {
        subjectId: parseInt(subjectId),
        text: text.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer,
        difficulty: difficulty || 'medium',
      },
      include: { subject: true },
    });
    res.json({ success: true, question });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

exports.update = async (req, res) => {
  const id = parseInt(req.params.id);
  const { subjectId, text, optionA, optionB, optionC, optionD, correctAnswer, difficulty } = req.body;
  if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
    return res.status(400).json({ success: false, message: "Javob A, B, C yoki D bo'lishi kerak" });
  }
  try {
    const question = await prisma.question.update({
      where: { id },
      data: {
        subjectId: parseInt(subjectId),
        text: text.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer,
        difficulty: difficulty || 'medium',
      },
      include: { subject: true },
    });
    res.json({ success: true, question });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

exports.destroy = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.question.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

exports.showImport = async (req, res) => {
  const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
  res.render('questions/import', { title: 'Excel Import' , subjects });
};

exports.importExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Fayl yuklanmadi' });
  }
  const defaultSubjectId = parseInt(req.body.defaultSubjectId) || null;
  try {
    const results = await importFromFile(req.file.path, defaultSubjectId);
    await fs.unlink(req.file.path).catch(() => {});
    res.json({ success: true, results });
  } catch (err) {
    await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadTemplate = (req, res) => {
  const buffer = generateTemplate();
  res.setHeader('Content-Disposition', 'attachment; filename="savol_template.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
};

exports.downloadSample = (req, res) => {
  const filePath = path.join(__dirname, '..', '..', 'sample_questions.xlsx');
  const fs = require('fs');
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Namuna fayl topilmadi. node create_sample_excel.js ni ishga tushiring.');
  }
  res.setHeader('Content-Disposition', 'attachment; filename="namuna_savollar.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.sendFile(filePath);
};
