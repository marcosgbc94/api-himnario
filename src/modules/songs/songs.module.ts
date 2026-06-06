import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Slide } from './entities/slide.entity';
import { SongSlide } from './entities/song-slide.entity';
import { SongType } from './entities/song-type.entity';
import { Song } from './entities/song.entity';
import { SongsController } from './controllers/songs.controller';
import { SongsService } from './services/songs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Song, SongType, SongSlide, Slide])],
  controllers: [SongsController],
  providers: [SongsService],
  exports: [SongsService],
})
export class SongsModule {}
