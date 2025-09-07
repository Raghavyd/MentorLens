import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from './storage';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function requireAuth(req: any, res: Response, next: NextFunction) {
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  storage.getUser(userId).then(user => {
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    };
    
    next();
  }).catch(error => {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  });
}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}