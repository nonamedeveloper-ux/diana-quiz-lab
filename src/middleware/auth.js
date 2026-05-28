function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.flash = { error: "Iltimos, tizimga kiring." };
    return res.redirect('/auth/login');
  }
  next();
}

function requireGuest(req, res, next) {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = { requireAuth, requireGuest };
