import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './core/users/users.module';
import { AuthModule } from './core/auth/auth.module';
import { EnvModel } from './models/env.model';
import { RolesModule } from './core/roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Deja la configuración disponible globalmente
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvModel>) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST', { infer: true }),
        port: configService.get('POSTGRES_PORT', { infer: true }),
        username: configService.get('POSTGRES_USER', { infer: true }),
        password: configService.get('POSTGRES_PASSWORD', { infer: true }),
        database: configService.get('POSTGRES_DB', { infer: true }),
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    RolesModule,
  ],
})
export class AppModule {}
