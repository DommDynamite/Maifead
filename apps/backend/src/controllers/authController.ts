import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { db } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import type { LoginRequest, SignupRequest, AuthResponse } from '../types/index.js';

export class AuthController {
  /**
   * User signup
   */
  static async signup(req: Request<{}, {}, SignupRequest>, res: Response) {
    try {
      const { email, username, displayName, password, inviteCode } = req.body;

      // Validate input
      if (!email || !username || !displayName || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      // Check if user already exists
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?')
        .get(email, username);

      if (existingUser) {
        return res.status(400).json({ error: 'Email or username already exists' });
      }

      // Determine user status and role based on invite code or admin email
      let status = 'pending';
      let role = 'user';
      let validInviteCodeId: string | null = null;

      // Check if this email matches the admin email from environment
      const adminEmail = process.env.ADMIN_EMAIL;

      if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) {
        // Admin email - make them admin and active
        status = 'active';
        role = 'admin';
      } else if (inviteCode) {
        // Validate invite code
        const invite = db.prepare(`
          SELECT id, used_by, expires_at
          FROM invite_codes
          WHERE code = ?
        `).get(inviteCode) as { id: string; used_by: string | null; expires_at: number | null } | undefined;

        if (!invite) {
          return res.status(400).json({ error: 'Invalid invite code' });
        }

        if (invite.used_by) {
          return res.status(400).json({ error: 'Invite code has already been used' });
        }

        if (invite.expires_at && invite.expires_at < Date.now()) {
          return res.status(400).json({ error: 'Invite code has expired' });
        }

        // Valid invite code - make user active
        status = 'active';
        validInviteCodeId = invite.id;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const userId = randomUUID();
      const now = Date.now();

      db.prepare(`
        INSERT INTO users (id, email, username, display_name, password_hash, role, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, email, username, displayName, passwordHash, role, status, now, now);

      // Create default preferences
      db.prepare(`
        INSERT INTO user_preferences (user_id)
        VALUES (?)
      `).run(userId);

      // Mark invite code as used if one was provided
      if (validInviteCodeId) {
        db.prepare(`
          UPDATE invite_codes
          SET used_by = ?, used_at = ?
          WHERE id = ?
        `).run(userId, now, validInviteCodeId);
      }

      // Generate token
      const token = generateToken(userId);

      // Get created user
      const user = db.prepare(`
        SELECT id, email, username, display_name, avatar_url, role, status, created_at
        FROM users WHERE id = ?
      `).get(userId) as any;

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          role: user.role,
          status: user.status,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.created_at),
        },
        token,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Failed to create account' });
    }
  }

  /**
   * User login
   */
  static async login(req: Request<{}, {}, LoginRequest>, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const user = db.prepare(`
        SELECT id, email, username, display_name, password_hash, avatar_url, role, status, created_at
        FROM users WHERE email = ?
      `).get(email) as any;

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if user is active
      if (user.status === 'pending') {
        return res.status(403).json({ error: 'Account is pending approval' });
      }

      if (user.status === 'banned') {
        return res.status(403).json({ error: 'Account has been banned' });
      }

      // Generate token
      const token = generateToken(user.id);

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          role: user.role,
          status: user.status,
          createdAt: new Date(user.created_at),
          updatedAt: new Date(user.created_at),
        },
        token,
      };

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }

  /**
   * Get current user
   */
  static async me(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const user = db.prepare(`
        SELECT id, email, username, display_name, avatar_url, role, status, created_at
        FROM users WHERE id = ?
      `).get(userId) as any;

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        role: user.role,
        status: user.status,
        createdAt: new Date(user.created_at),
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { displayName, username, email } = req.body;

      // Check if username or email is taken by another user
      if (username || email) {
        const existing = db.prepare(`
          SELECT id FROM users
          WHERE (username = ? OR email = ?) AND id != ?
        `).get(username, email, userId);

        if (existing) {
          return res.status(400).json({ error: 'Username or email already taken' });
        }
      }

      // Build update query
      const updates: string[] = [];
      const values: any[] = [];

      if (displayName) {
        updates.push('display_name = ?');
        values.push(displayName);
      }
      if (username) {
        updates.push('username = ?');
        values.push(username);
      }
      if (email) {
        updates.push('email = ?');
        values.push(email);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      updates.push('updated_at = ?');
      values.push(Date.now());
      values.push(userId);

      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
        .run(...values);

      // Get updated user
      const user = db.prepare(`
        SELECT id, email, username, display_name, avatar_url, role, status, created_at
        FROM users WHERE id = ?
      `).get(userId) as any;

      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        role: user.role,
        status: user.status,
        createdAt: new Date(user.created_at),
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      db.prepare('DELETE FROM users WHERE id = ?').run(userId);

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }
}
