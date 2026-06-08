import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

import { CreateSlideDto } from './create-slide.dto';
import { CreateSongDto } from './create-song.dto';

export class UpdateSongDto extends PartialType(CreateSongDto) {
  @IsArray({ message: 'Los slides deben ser una lista' })
  @IsNotEmpty({
    message: 'Si vas a actualizar los slides, la lista no puede estar vacía',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateSlideDto)
  override slides!: CreateSlideDto[];
}
