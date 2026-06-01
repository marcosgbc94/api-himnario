import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import { UserLoginDto } from '../dto/user-login.dto';
import { ClassConstructor, plainToInstance } from 'class-transformer';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login de usuario' })
  @ApiResponse({ status: 401, description: 'Usuario no autorizado' })
  @ApiResponse({ status: 500, description: 'Error al validar el usuario' })
  @ApiBody({ type: LoginDto })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Req() req: any,
  ): { user: UserLoginDto; token: string } {
    const user = req.user as User;
    const roles = user.userRoles?.map((userRole) => userRole.role.slug) || [];
    const token = this.authService.generateToken(user.id, user.email, roles);

    const userDto: UserLoginDto = {
      id: user.id,
      email: user.email,
      roles: roles,
    };

    return { user: userDto, token };
  }
}
