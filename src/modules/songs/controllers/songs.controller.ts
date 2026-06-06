import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Roles } from '../../../core/roles/decorators/roles.decorator';
import { RoleSlugEnum } from 'src/core/roles/enums/role-slug.enum';
import { SongsService } from '../services/songs.service';
import { CreateSongDto } from '../dto/create-song.dto';
import { UpdateSongDto } from '../dto/update-song.dto';

@Controller('song')
export class SongsController {
  constructor(private songsService: SongsService) {}

  @ApiOperation({ summary: 'Obtener todas las canciones' })
  @ApiResponse({ status: 200, description: 'Lista de todas las canciones' })
  @ApiResponse({ status: 500, description: 'Error al obtener las canciones' })
  @Roles(RoleSlugEnum.ADMIN, RoleSlugEnum.USER)
  @Get()
  async findAll() {
    return await this.songsService.findAll();
  }

  @ApiOperation({ summary: 'Obtener todas las canciones' })
  @ApiResponse({ status: 200, description: 'Lista de todas las canciones' })
  @ApiResponse({ status: 500, description: 'Error al obtener las canciones' })
  @Roles(RoleSlugEnum.ADMIN, RoleSlugEnum.USER)
  @Get(':songId')
  async findOne(@Param('songId', new ParseUUIDPipe()) songId: string) {
    return await this.songsService.findOne(songId);
  }

  @ApiOperation({ summary: 'Busqueda personalizada de canciones' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las canciones encontradas',
  })
  @ApiResponse({ status: 500, description: 'Error al obtener las canciones' })
  @Roles(RoleSlugEnum.ADMIN, RoleSlugEnum.USER)
  @Get('search')
  async search(@Query('term') term: string) {
    return await this.songsService.search(term);
  }

  @ApiOperation({ summary: 'Crear una nueva canción' })
  @ApiResponse({ status: 201, description: 'Canción creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de la canción inválidos' })
  @ApiResponse({ status: 500, description: 'Error al crear la canción' })
  @Roles(RoleSlugEnum.ADMIN, RoleSlugEnum.USER)
  @Post()
  async create(@Body() createSongDto: CreateSongDto, @Req() req: any) {
    const executorId = req.user?.id || req.user?.sub;
    return await this.songsService.create(createSongDto, executorId);
  }

  @ApiOperation({ summary: 'Actualizar una canción existente' })
  @ApiResponse({ status: 200, description: 'Canción actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de la canción inválidos' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la canción' })
  @Roles(RoleSlugEnum.ADMIN, RoleSlugEnum.USER)
  @Put(':songId')
  async update(
    @Param('songId', new ParseUUIDPipe()) songId: string,
    @Body() updateSongDto: UpdateSongDto,
    @Req() req: any,
  ) {
    const executorId = req.user?.id || req.user?.sub;
    return await this.songsService.update(songId, updateSongDto, executorId);
  }
}
