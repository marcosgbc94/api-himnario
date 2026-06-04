export class CreateSongDto {
    @IsString({ message: 'El título debe ser un texto' })
    @IsNotEmpty({ message: 'El título de la canción es obligatorio' })
    @Length(1, 256, { message: 'El título debe tener entre 1 y 256 caracteres' })
    title!: string;
  
    @IsString({ message: 'La descripción debe ser un texto' })
    @IsOptional()
    @Length(0, 512, { message: 'La descripción no puede superar los 512 caracteres' })
    summary?: string;
  
    @IsUUID('4', { message: 'El tipo de canción debe ser un UUID válido de la tabla song_type' })
    @IsNotEmpty({ message: 'El tipo de canción (typeId) es obligatorio' })
    typeId!: string;
  
    // 🔄 Validación profunda para el arreglo de estrofas
    @IsArray({ message: 'Los slides deben venir en formato de lista (arreglo)' })
    @IsNotEmpty({ message: 'La canción debe tener al menos un slide para ser creada' })
    @ValidateNested({ honesty: true, each: true })
    @Type(() => CreateSlideDto) 
    slides!: CreateSlideDto[];
  }