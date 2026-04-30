const crypto = require('crypto');

const csrfMiddleware = (req, res, next) => {
  // Methods that don't change state are safe
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  // Check if token exists in cookies
  let token = req.cookies['XSRF-TOKEN'];

  if (!token) {
    // Generate a new token if one doesn't exist
    token = crypto.randomBytes(32).toString('hex');
    // Set cookie (not HttpOnly so frontend can read it)
    res.cookie('XSRF-TOKEN', token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }

  // If method is safe, just proceed
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // For state-changing methods, verify token
  const headerToken = req.headers['x-xsrf-token'];

  if (!headerToken || headerToken !== token) {
    return res.status(403).json({
      success: false,
      message: 'تم رفض الطلب بسبب عدم وجود أو تطابق رمز الحماية (CSRF)' // Arabic message for CSRF error
    });
  }

  next();
};

module.exports = csrfMiddleware;
