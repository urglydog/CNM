// Kiểm tra đã đăng nhập
function auth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Kiểm tra quyền theo role
function authorizeRole(requiredRole) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.redirect('/login');
    }
    const { role } = req.session.user;
    if (role !== requiredRole) {
      return res.status(403).send('Bạn không có quyền thực hiện chức năng này');
    }
    next();
  };
}

module.exports = auth;
module.exports.authorizeRole = authorizeRole;
