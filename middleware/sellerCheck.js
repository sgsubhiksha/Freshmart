exports.isSeller = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'seller') return next();
  if (req.xhr || (req.headers.accept && req.headers.accept.includes('json'))) {
    return res.status(401).json({ success: false, message: 'Seller access required.' });
  }
  res.redirect('/seller/login');
};