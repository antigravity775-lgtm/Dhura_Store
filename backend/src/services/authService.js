const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UnauthorizedError, BadRequestError } = require('../middleware/errorMiddleware');

class AuthService {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Auth response with user info and token
   */
  async register(userData) {
    const { fullName, password, city } = userData;
    const email = userData.email ? userData.email.trim() : '';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestError('Email is already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        city,
        role: 'Buyer' // Default role (matches Prisma enum: Admin, Seller, Buyer)
      }
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      userId: user.id,
      fullName: user.fullName,
      token
    };
  }

  /**
   * Login user
   * @param {Object} loginData - Login credentials
   * @returns {Promise<Object>} Auth response with user info and token
   */
  async login(loginData) {
    const { password } = loginData;
    const email = loginData.email ? loginData.email.trim() : '';

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      userId: user.id,
      fullName: user.fullName,
      token
    };
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile data
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        email: true,
        role: true,
        city: true,
        isVerified: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true
        // Note: passwordHash is excluded for security
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(userId, updateData) {
    // Remove fields that shouldn't be updated directly
    const { id: _, userId: ____, passwordHash: __, role: ___, ...dataToUpdate } = updateData;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        email: true,
        role: true,
        city: true,
        isVerified: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Success indicator
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('كلمة المرور الحالية غير صحيحة');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    return true;
  }
}

module.exports = AuthService;