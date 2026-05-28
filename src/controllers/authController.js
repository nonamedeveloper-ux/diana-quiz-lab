'use strict';

const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const { setFlash } = require('../utils/helpers');

exports.showLogin = (req, res) => {
  res.render('auth/login', { title: 'Kirish', error: null });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('auth/login', {
      title: 'Kirish',
      error: "Login va parol to'ldirilishi shart.",
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('auth/login', {
        title: 'Kirish',
        error: "Login yoki parol noto'g'ri.",
      });
    }

    req.session.user = { id: user.id, username: user.username, role: user.role };
    req.session.save(() => res.redirect('/dashboard'));
  } catch (err) {
    console.error('Login error:', err);
    res.render('auth/login', { title: 'Kirish', error: 'Server xatosi.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/auth/login'));
};
