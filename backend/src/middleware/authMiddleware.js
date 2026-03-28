const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { UnauthorizedError } = require('./errorMiddleware');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        // Get user from token using Prisma
        req.user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isVerified: true,
            isBlocked: true
          }
        });

        if (!req.user) {
          throw new UnauthorizedError('User not found');
        }

        return next();
      } catch (error) {
        console.error(error);
        throw new UnauthorizedError('Not authorized, token failed');
      }
    }

    if (!token) {
      throw new UnauthorizedError('Not authorized, no token');
    }
  } catch (error) {
    next(error);
  }
};

// Role authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authorized'));
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`User role '${req.user.role}' is not authorized to access this route`));
    }
    next();
  };
};

module.exports = { protect, authorize };