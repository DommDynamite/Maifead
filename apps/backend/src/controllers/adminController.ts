import { Response } from 'express';
import { db } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { randomBytes } from 'crypto';

// Get all users
export const getUsers = (req: AuthRequest, res: Response) => {
  try {
    const users = db.prepare(`
      SELECT id, email, username, display_name as displayName, avatar_url as avatarUrl,
             role, status, created_at as createdAt
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Approve a pending user
export const approveUser = (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const result = db.prepare(`
      UPDATE users
      SET status = 'active'
      WHERE id = ? AND status = 'pending'
    `).run(userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found or not pending' });
    }

    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
};

// Ban a user
export const banUser = (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Prevent admins from banning themselves
    if (userId === req.userId) {
      return res.status(400).json({ error: 'Cannot ban yourself' });
    }

    const result = db.prepare(`
      UPDATE users
      SET status = 'banned'
      WHERE id = ?
    `).run(userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
};

// Unban a user
export const unbanUser = (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const result = db.prepare(`
      UPDATE users
      SET status = 'active'
      WHERE id = ? AND status = 'banned'
    `).run(userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found or not banned' });
    }

    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
};

// Get all invite codes
export const getInviteCodes = (req: AuthRequest, res: Response) => {
  try {
    const codes = db.prepare(`
      SELECT id, code, created_by as createdBy, used_by as usedBy,
             created_at as createdAt, used_at as usedAt, expires_at as expiresAt
      FROM invite_codes
      ORDER BY created_at DESC
    `).all();

    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

    // Add invite URL to each code
    const codesWithUrls = codes.map((code: any) => ({
      ...code,
      inviteUrl: `${baseUrl}/auth?invite=${code.code}`,
    }));

    res.json({ inviteCodes: codesWithUrls });
  } catch (error) {
    console.error('Error fetching invite codes:', error);
    res.status(500).json({ error: 'Failed to fetch invite codes' });
  }
};

// Generate a new invite code
export const generateInviteCode = (req: AuthRequest, res: Response) => {
  try {
    const code = randomBytes(8).toString('hex').toUpperCase();
    const id = randomBytes(16).toString('hex');
    const now = Date.now();

    // Optional: Set expiration (e.g., 7 days from now)
    const expiresAt = req.body.expiresInDays
      ? now + (req.body.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    db.prepare(`
      INSERT INTO invite_codes (id, code, created_by, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, code, req.userId, now, expiresAt);

    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

    const inviteCode = {
      id,
      code,
      createdBy: req.userId,
      usedBy: null,
      createdAt: now,
      usedAt: null,
      expiresAt,
      inviteUrl: `${baseUrl}/auth?invite=${code}`,
    };

    res.json({ inviteCode });
  } catch (error) {
    console.error('Error generating invite code:', error);
    res.status(500).json({ error: 'Failed to generate invite code' });
  }
};

// Delete an invite code
export const deleteInviteCode = (req: AuthRequest, res: Response) => {
  try {
    const { codeId } = req.params;

    const result = db.prepare(`
      DELETE FROM invite_codes
      WHERE id = ? AND used_by IS NULL
    `).run(codeId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Invite code not found or already used' });
    }

    res.json({ message: 'Invite code deleted successfully' });
  } catch (error) {
    console.error('Error deleting invite code:', error);
    res.status(500).json({ error: 'Failed to delete invite code' });
  }
};
