import { Body, Controller, Get, Post, Req, UseGuards, Put, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';

/**
 * AuthController - Handles all authentication-related HTTP endpoints
 *
 * Security Features:
 * - JWT-based authentication with HTTP-only cookies
 * - Rate limiting on login and password reset endpoints
 * - Secure cookie settings (httpOnly, sameSite, secure in production)
 * - Password reset with expiring tokens
 * - Login attempt tracking
 *
 * Cookie Configuration:
 * - Name: 'appsec_token' (IMPORTANT: Must match frontend middleware)
 * - HttpOnly: true (prevents XSS attacks)
 * - SameSite: 'lax' (CSRF protection)
 * - Secure: true in production (HTTPS only)
 * - MaxAge: 24 hours
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Cookie name used for JWT token storage
   * CRITICAL: This must match the cookie name checked in frontend middleware.ts
   */
  private readonly cookieName = 'appsec_token';

  /**
   * Attaches JWT token to HTTP-only cookie
   * @param res - Express response object
   * @param token - JWT token to store
   */
  private attachAuthCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie(this.cookieName, token, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      sameSite: 'lax', // CSRF protection
      secure: isProd, // HTTPS only in production
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      path: '/', // Cookie available for all routes
    });
  }

  /**
   * Clears authentication cookie on logout
   * @param res - Express response object
   */
  private clearAuthCookie(res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie(this.cookieName, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
    });
  }

  /**
   * POST /api/auth/login
   * Authenticates user with email and password
   *
   * Rate Limit: 5 attempts per minute per IP
   * Returns: User object + JWT token (stored in cookie)
   * Logs: All login attempts with IP and user-agent
   */
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() body: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body.email, body.password, req.ip, req.headers['user-agent']);
    this.attachAuthCookie(res, result.access_token);
    return result;
  }

  /**
   * POST /api/auth/register
   * Creates a new user account
   *
   * Returns: User object + JWT token (stored in cookie)
   * Note: Automatically logs in user after registration
   */
  @Post('register')
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(body);
    this.attachAuthCookie(res, result.access_token);
    return result;
  }

  /**
   * POST /api/auth/forgot-password
   * Generates password reset token
   *
   * Rate Limit: 3 attempts per 5 minutes per IP
   * Returns: Reset token (for development) - in production, sent via email
   * Token expires in 1 hour
   */
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  forgotPassword(@Body() body: ForgotPasswordDto, @Req() req: Request) {
    return this.authService.forgotPassword(body, req.ip, req.headers['user-agent']);
  }

  /**
   * POST /api/auth/reset-password
   * Resets password using valid token
   *
   * Validates: Token existence, expiration, and one-time use
   * Hashes new password with bcrypt
   */
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  /**
   * GET /api/auth/me
   * Returns current authenticated user profile
   *
   * Protected: Requires valid JWT token
   * Used by: Frontend to hydrate user state
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.profile(user.sub);
  }

  /**
   * PUT /api/auth/me
   * Updates current user profile
   *
   * Protected: Requires valid JWT token
   * Allows updates: name, title, language
   */
  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Body() body: UpdateProfileDto, @Req() req: Request) {
    const user = req.user as any;
    return this.authService.updateProfile(user.sub, body);
  }

  /**
   * POST /api/auth/logout
   * Logs out user by clearing auth cookie
   *
   * Note: Client should also clear user state
   */
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookie(res);
    return { message: 'Sessão finalizada.' };
  }
}
