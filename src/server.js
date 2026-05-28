'use strict';

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure required directories exist
['exports', 'uploads'].forEach(dir => {
  const p = path.join(__dirname, '..', dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// ─── Security ───────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com', 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    },
  })
);

app.use(
  rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Ko'p so'rov. 15 daqiqadan so'ng urinib ko'ring.",
});

// ─── Body parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Session ─────────────────────────────────────────────────────────────────
const SQLiteStore = require('connect-sqlite3')(session);
app.use(
  session({
    store: new SQLiteStore({
      db: 'sessions.db',
      dir: process.env.NODE_ENV === 'production' ? '/var/data' : path.join(__dirname, '..', 'prisma'),
    }),
    secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// ─── Locals middleware ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.flash = req.session.flash || {};
  res.locals.user = req.session.user || null;
  delete req.session.flash;
  next();
});

// ─── View engine ─────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Static ──────────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/', require('./routes/index'));
app.use('/auth', authLimiter, require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/subjects', require('./routes/subjects'));
app.use('/questions', require('./routes/questions'));
app.use('/generator', require('./routes/generator'));
app.use('/guide', require('./routes/guide'));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 — Topilmadi',
    message: 'Siz qidirayotgan sahifa mavjud emas.',
    code: 404,
  });
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).render('error', {
    title: '500 — Server xatosi',
    message: 'Kutilmagan xato yuz berdi.',
    code: 500,
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀  Server: http://localhost:${PORT}`);
  console.log(`🌍  Mode  : ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
