export class CreateSlideDto {
    @IsString({ message: 'La letra del slide debe ser un texto válido' })
    @IsNotEmpty({ message: 'El texto del slide no puede estar vacío' })
    content!: string;
  }