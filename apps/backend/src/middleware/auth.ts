import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;

      // Check if user exists and is active
      const user = db.prepare('SELECT status, role FROM users WHERE id = ?').get(req.userId) as { status: string; role: string } | undefined;

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ error: 'Account pending approval. Please wait for an admin to approve your account.' });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Authentication error' });
  }
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user from database to check role
    const user = db.prepare('SELECT role, status FROM users WHERE id = ?').get(req.userId) as { role: string; status: string } | undefined;

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization error' });
  }
};
