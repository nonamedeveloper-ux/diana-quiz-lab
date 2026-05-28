function setFlash(req, type, message) {
  req.session.flash = req.session.flash || {};
  req.session.flash[type] = message;
}

function paginate(totalItems, currentPage, pageSize) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const page = Math.max(1, Math.min(currentPage, totalPages));
  return {
    total: totalItems,
    page,
    pageSize,
    totalPages,
    offset: (page - 1) * pageSize,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('uz-UZ', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

module.exports = { setFlash, paginate, sanitizeString, formatDate };
