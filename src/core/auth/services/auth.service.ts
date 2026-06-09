import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../../users/services/users.service';
import { Payload } from '../models/payload.model';
import { AuditService } from '../../audit/services/audit.service';
import { AuditActionEnum } from '../../audit/enums/AuditAction.enum';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private auditService: AuditService,
  ) {}

  // Valida un usuario comparando el email y la contraseña con los
  // datos almacenados en la base de datos
  async validateUser(email: string, password: string, ip: string, url: string) {
    try {
      const user = await this.userService.findByEmail(email);
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        await this.auditService.createLog({
          userId: user.id,
          action: AuditActionEnum.LOGIN_FAILED,
          method: 'POST',
          url,
          payload: { email },
          ip,
        });
        throw new UnauthorizedException('Usuario no autorizado');
      }

      await this.auditService.createLog({
        userId: user.id,
        action: AuditActionEnum.LOGIN_SUCCESS,
        method: 'POST',
        url,
        payload: { email },
        ip,
      });

      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al validar el usuario');
    }
  }

  // Genera un token JWT para el usuario autenticado
  generateToken(userId: string): string {
    const payload: Payload = { sub: userId };
    return this.jwtService.sign(payload);
  }
}
