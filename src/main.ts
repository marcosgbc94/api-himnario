import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración global de Validación y Transformación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades del JSON que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza un error si el cliente envía propiedades de más
      transform: true, // Transforma los tipos de datos automáticamente (ej: string a number)
    }),
  );

  // Aplica el interceptor de serialización globalmente para manejar la exclusión de campos con @Exclude() en las entidades
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Configuración de Swagger para la documentación de la API
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Himnario API')
    .setDescription('API para himnario')
    .setVersion('1.0')
    .build();
  const documentFactory = () => {
    return SwaggerModule.createDocument(app, swaggerConfig);
  };
  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
