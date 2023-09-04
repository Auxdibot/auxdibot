import { NextFunction, Request, Response } from 'express';

export default function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
   if (!req.isAuthenticated()) return res.status(401).json({ error: 'unauthorized' });
   return next();
}
