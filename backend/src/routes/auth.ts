import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, company, walletAddress } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
        timestamp: new Date()
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        timestamp: new Date()
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role: role || 'operator',
      company,
      walletAddress
    });

    await user.save();

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      },
      message: 'User registered successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user',
      timestamp: new Date()
    });
  }
});

// Login user
router.post('/login',
  auditLog('LOGIN', 'user'),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
          timestamp: new Date()
        });
      }

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials or inactive account',
          timestamp: new Date()
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          timestamp: new Date()
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }

      const token = jwt.sign(
        { userId: user.id },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
      );

      // Remove password from response
      const userResponse = user.toJSON();

      res.json({
        success: true,
        data: {
          user: userResponse,
          token
        },
        message: 'Login successful',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        timestamp: new Date()
      });
    }
  }
);

// Get current user profile
router.get('/profile',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      res.json({
        success: true,
        data: req.user,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user profile',
        timestamp: new Date()
      });
    }
  }
);

// Update user profile
router.put('/profile',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { name, company, walletAddress } = req.body;
      const user = req.user!;

      // Update allowed fields
      if (name) user.name = name;
      if (company !== undefined) user.company = company;
      if (walletAddress !== undefined) user.walletAddress = walletAddress;

      await user.save();

      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        timestamp: new Date()
      });
    }
  }
);

// Change password
router.post('/change-password',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required',
          timestamp: new Date()
        });
      }

      // Get user with password
      const user = await User.findById(req.user!.id).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          timestamp: new Date()
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect',
          timestamp: new Date()
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to change password',
        timestamp: new Date()
      });
    }
  }
);

// Logout (client-side token invalidation)
router.post('/logout',
  authenticateToken,
  auditLog('LOGOUT', 'user'),
  async (req: AuthRequest, res) => {
    try {
      // In a more sophisticated setup, you might maintain a blacklist of tokens
      // For now, we just return success and let the client handle token removal
      
      res.json({
        success: true,
        message: 'Logout successful',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        timestamp: new Date()
      });
    }
  }
);

// Verify token (for client-side token validation)
router.get('/verify',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      res.json({
        success: true,
        data: {
          valid: true,
          user: req.user
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({
        success: false,
        error: 'Token verification failed',
        timestamp: new Date()
      });
    }
  }
);

export default router;