'use strict';

const prisma = require('../config/database');

exports.index = async (req, res) => {
  try {
    const [totalQuestions, totalSubjects, totalTests, recentTests] = await Promise.all([
      prisma.question.count(),
      prisma.subject.count(),
      prisma.generatedTest.count(),
      prisma.generatedTest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { subject: true },
      }),
    ]);

    const subjectStats = await prisma.subject.findMany({
      include: { _count: { select: { questions: true } } },
      orderBy: { name: 'asc' },
    });

    res.render('dashboard/index', {
      title: 'Dashboard',
      totalQuestions,
      totalSubjects,
      totalTests,
      recentTests,
      subjectStats,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.render('error', { title: 'Xato', message: 'Dashboard yuklanmadi.', code: 500 });
  }
};
