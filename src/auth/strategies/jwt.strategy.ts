import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Payload } from '../models/Payload.model';
import { EnvModel } from 'src/models/env.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService<EnvModel>) {
    const secret = configService.get('JWT_SECRET', { infer: true });

    if (!secret) {
      throw new Error('JWT Secret no está configurada');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: Payload) {
    return payload;
  }
}
