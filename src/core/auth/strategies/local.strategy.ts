import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true, // Inyecta Request en el callback de validación primero
    });
  }

  async validate(req: Request, email: string, password: string) {
    const ip = (req.headers['x-forwarded-for'] as string) || (req.ip as string) || '';
    const url = req.url;

    return await this.authService.validateUser(email, password, ip, url);
  }
}
