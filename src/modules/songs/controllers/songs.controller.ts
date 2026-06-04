import { SongsService } from "../services/songs.service";

@Controller('song')
export class SongsController {
  constructor(
    private songsService: SongsService;
  ) {}

  @ApiOperation({ summary: 'Obtener todas las canciones' })
  @ApiResponse({ status: 200, description: 'Lista de todas las canciones' })
  @ApiResponse({ status: 500, description: 'Error al obtener las canciones' })
  @Roles(RoleSlugEnum.ADMIN, RoleSlugEnum.USER)
  @Get()
  async findAll() {
    return this.songsService.findAll();
  }

  @ApiOperation({ summary: 'Obtener todas las canciones' })
  @ApiResponse({ status: 200, description: 'Lista de todas las canciones' })
  @ApiResponse({ status: 500, description: 'Error al obtener las canciones' })
  @Roles(RoleSlugEnum.ADMIN, RoleSlugEnum.USER)
  @Get(':id')
  async findOne(@Param('songId', new ParseUUIDPipe()) songId: string) {
    return this.songsService.findOne(songId);
  }

  @ApiOperation({ summary: 'Busqueda personalizada de canciones' })
  @ApiResponse({ status: 200, description: 'Lista de todas las canciones encontradas' })
  @ApiResponse({ status: 500, description: 'Error al obtener las canciones' })
  @Roles(RoleSlugEnum.ADMIN, RoleSlugEnum.USER)
  @Get('search')
  async search(@Query('term') term: string) {
    return this.songsService.search(term);
  }
}