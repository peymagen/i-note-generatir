import jwt from "jsonwebtoken";
import { type NextFunction, type Request, type Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import process from "process";
import { IUser } from "../../api/user/user.dto";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const roleAuth = (publicRoutes: string[] = []) =>
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (publicRoutes.includes(req.path)) {
        next();
        return;
      }
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        throw createHttpError(401, {
          message: `Invalid token`,
        });
      }

      // Decode and verify JWT
      let decodedUser;
      try {
        decodedUser = jwt.verify(token, process.env.JWT_SECRET!);
      } catch (err) {
        throw createHttpError(401, { message: "Invalid or expired token" });
      }

     
      req.user = decodedUser as IUser & { role: string };
      console.log("User:", req.user);
      
      next();
    }
  );

export const requireRole = (allowedRoles: string[] = []) =>
  expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const role = (req.user as (IUser & { role?: string }) | undefined)?.role;
    console.log(role);
    if (allowedRoles.length === 0 || (role && allowedRoles.includes(role))) {
      next();
      return;
    }
    throw createHttpError(403, { message: "Forbidden: insufficient permissions" });
  });
