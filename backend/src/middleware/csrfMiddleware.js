const crypto = require('crypto');

function getCsrfCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  // Cross-domain deployments (frontend + API on different origins) require SameSite=None.
  const sameSite = isProd ? 'none' : 'lax';
  return {
    secure: isProd,
    sameSite,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  };
}

const csrfMiddleware = (req, res, next) => {
  // Methods that don't change state are safe
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  // Check if token exists in cookies
  let token = req.cookies['XSRF-TOKEN'];

  if (!token) {
    // Generate a new token if one doesn't exist
    token = crypto.randomBytes(32).toString('hex');
    // Set cookie (not HttpOnly so frontend can read it)
    res.cookie('XSRF-TOKEN', token, getCsrfCookieOptions());
  }

  // Expose token in response header so cross-origin frontends can read it.
  // (They cannot read cookies from another origin via document.cookie.)
  res.setHeader('x-xsrf-token', token);

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
