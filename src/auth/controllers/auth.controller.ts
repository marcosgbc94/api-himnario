import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from '../services/auth.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login de usuario' })
  @ApiResponse({ status: 401, description: 'Usuario no autorizado' })
  @ApiResponse({ status: 500, description: 'Error al validar el usuario' })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request) {
    const user = req.user as User;
    const token = this.authService.generateToken(user);
    return { user, token };
  }
}
