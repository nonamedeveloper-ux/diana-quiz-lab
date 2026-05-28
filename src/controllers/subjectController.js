'use strict';

const prisma = require('../config/database');
const { setFlash } = require('../utils/helpers');

exports.index = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: { _count: { select: { questions: true, tests: true } } },
      orderBy: { name: 'asc' },
    });
    res.render('subjects/index', { title: 'Fanlar', subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

exports.create = async (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Fan nomi bo'sh bo'lishi mumkin emas" });
  }
  try {
    const subject = await prisma.subject.create({
      data: { name: name.trim(), description: description?.trim() || null },
    });
    res.json({ success: true, subject });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Bu nomli fan allaqachon mavjud' });
    }
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

exports.update = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Fan nomi bo'sh bo'lishi mumkin emas" });
  }
  try {
    const subject = await prisma.subject.update({
      where: { id },
      data: { name: name.trim(), description: description?.trim() || null },
    });
    res.json({ success: true, subject });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Bu nomli fan allaqachon mavjud' });
    }
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

exports.destroy = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const count = await prisma.question.count({ where: { subjectId: id } });
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu fanda ${count} ta savol bor. Avval savollarni o'chiring.`,
      });
    }
    await prisma.subject.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};
