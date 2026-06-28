// Ensure user is logged in
exports.isLoggedIn = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login');
};

// Ensure user is admin
exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.status(403).render('error', { message: 'Access denied. Admins only.' });
};