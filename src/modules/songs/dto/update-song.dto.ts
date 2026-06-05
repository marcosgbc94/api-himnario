import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class CreateSongDto extends PartialType(CreateSongDto) {
  @IsArray({ message: 'Los slides deben ser una lista' })
  @IsNotEmpty({ message: 'Si vas a actualizar los slides, la lista no puede estar vacía' })
  @ValidateNested({ each: true })
  @Type(() => CreateSlideSongDto)
  override slides!: CreateSlideSongDto[];
}