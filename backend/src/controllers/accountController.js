const AuthService = require('../services/authService');
const { ValidationError } = require('../middleware/errorMiddleware');

class AccountController {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   * POST /api/account/register
   */
  async register(req, res) {
    try {
      // Validate required fields
      const requiredFields = ['fullName', 'email', 'password'];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          throw new ValidationError(`${field} is required`);
        }
      }

      const result = await this.authService.register(req.body);
      res.status(200).json(result);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   * POST /api/account/login
   */
  async login(req, res) {
    try {
      // Validate required fields
      if (!req.body.email || !req.body.password) {
        throw new ValidationError('Email and password are required');
      }

      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile
   * GET /api/account/profile
   */
  async getProfile(req, res) {
    try {
      // In a real app, we'd get the userId from the authenticated user via middleware
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401);
        throw new Error('Unauthorized');
      }

      const profile = await this.authService.getProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * PUT /api/account/profile
   */
  async updateProfile(req, res) {
    try {
      // In a real app, we'd get the userId from the authenticated user via middleware
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401);
        throw new Error('Unauthorized');
      }

      // Prevent users from changing their own role or ID
      const updateData = { ...req.body };
      delete updateData.role;
      delete updateData._id;

      // Check if user is trying to update another user's profile
      if (updateData.userId && updateData.userId !== userId && updateData.userId !== '') {
        res.status(403);
        throw new Error('Forbidden');
      }

      // If userId is empty, set it to the current user's ID
      if (!updateData.userId || updateData.userId === '') {
        updateData.userId = userId;
      }

      await this.authService.updateProfile(userId, updateData);
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
  /**
   * Change user password
   * PUT /api/account/change-password
   */
  async changePassword(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401);
        throw new Error('Unauthorized');
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new ValidationError('كلمة المرور الحالية والجديدة مطلوبة');
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AccountController();