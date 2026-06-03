import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string, req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
    const url = req.url;

    return await this.authService.validateUser(email, password, ip, url);
  }
}
