import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { otpService } from './otp.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await authService.login(req.body, { ip, userAgent });

      sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      sendCreated(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await authService.refreshToken(req.body, { ip, userAgent });
      sendSuccess(res, result, 'Token refreshed successfully');
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { refreshToken, allDevices } = req.body;
      const ip = req.ip || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      await authService.logout(userId, refreshToken, allDevices, { ip, userAgent });
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body);
      sendSuccess(res, null, result.message);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body);
      sendSuccess(res, null, result.message);
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ip = req.ip || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await authService.changePassword(userId, req.body, { ip, userAgent });
      sendSuccess(res, null, result.message);
    } catch (err) {
      next(err);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await authService.verifyEmail(token);
      sendSuccess(res, null, result.message);
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await authService.me(userId);
      sendSuccess(res, result, 'User profile fetched');
    } catch (err) {
      next(err);
    }
  }

  async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const sessions = await authService.getSessions(userId);
      sendSuccess(res, sessions, 'Active sessions fetched');
    } catch (err) {
      next(err);
    }
  }

  async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.params;
      const result = await authService.revokeSession(userId, sessionId!);
      sendSuccess(res, null, result.message);
    } catch (err) {
      next(err);
    }
  }

  async signupInstitute(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await authService.signupInstitute(req.body, { ip, userAgent });
      sendCreated(res, result, 'Institute registered successfully. You are now logged in.');
    } catch (err) {
      next(err);
    }
  }

  // ─── OTP ENDPOINTS ───

  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, purpose } = req.body;
      if (!email || !purpose) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'email and purpose are required' } });
        return;
      }
      const validPurposes = ['signup', 'login', 'reset', 'invite'];
      if (!validPurposes.includes(purpose)) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid purpose' } });
        return;
      }
      const otp = await otpService.generateOtp(email, purpose);
      await otpService.sendOtpEmail(email, otp, purpose);
      sendSuccess(res, { sent: true, expiresIn: 300 }, 'OTP sent to your email.');
    } catch (err) { next(err); }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, purpose } = req.body;
      if (!email || !otp || !purpose) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'email, otp, and purpose are required' } });
        return;
      }
      await otpService.verifyOtp(email, otp, purpose);
      sendSuccess(res, { verified: true }, 'OTP verified successfully.');
    } catch (err) { next(err); }
  }

  async signupWithOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { otpCode } = req.body;
      if (!otpCode) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'otpCode is required for OTP signup' } });
        return;
      }

      // Verify OTP first
      await otpService.verifyOtp(req.body.email, otpCode, 'signup');

      // OTP verified - proceed with signup
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const result = await authService.signupInstitute(req.body, { ip, userAgent });
      sendCreated(res, result, 'Email verified. Institute registered successfully.');
    } catch (err) { next(err); }
  }
}

export const authController = new AuthController();
