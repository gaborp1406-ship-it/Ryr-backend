// campaniamasiva.controller.ts
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CampaniaMasivaService } from './campaniamasiva.service';
import type { CrearCampaniaDto } from './campaniamasiva.service';
import { CloudinaryService } from './cloudinary.service';

// ⚠️ Protégelo con tu guard/JWT, igual que los endpoints del chat:
// @UseGuards(JwtAuthGuard)
@Controller('campanias')
export class CampaniaMasivaController {
    constructor(
        private readonly service: CampaniaMasivaService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    /** Plantillas aprobadas en Meta (para el selector del front) */
    @Get('plantillas')
    plantillas() {
        return this.service.plantillas();
    }

    /**
     * Sube el archivo del header (video/imagen/PDF) a Cloudinary y devuelve la URL pública.
     * Multipart con el campo "archivo"; ?tipo=video|image|document
     * Los límites finos por tipo se validan en CloudinaryService.
     */
    @Post('archivo')
    @UseInterceptors(
        FileInterceptor('archivo', {
            storage: memoryStorage(),
            limits: { fileSize: 100 * 1024 * 1024, files: 1 },
        }),
    )
    subirArchivo(@UploadedFile() archivo: Express.Multer.File, @Query('tipo') tipo: string) {
        return this.cloudinary.subir(archivo, tipo);
    }

    @Get()
    listar() {
        return this.service.listar();
    }

    /** Lista de exclusión. OJO: debe ir ANTES de @Get(':id') o Nest lo toma como un id */
    @Get('optout')
    listarOptout() {
        return this.service.listarOptout();
    }

    @Post()
    crear(@Body() dto: CrearCampaniaDto, @Req() req: any) {
        return this.service.crear(dto, req.user?.id);
    }

    @Get(':id')
    detalle(@Param('id', ParseIntPipe) id: number) {
        return this.service.detalle(id);
    }

    @Get(':id/destinatarios')
    destinatarios(
        @Param('id', ParseIntPipe) id: number,
        @Query('estado') estado?: string,
        @Query('pagina') pagina?: string,
        @Query('limite') limite?: string,
    ) {
        return this.service.destinatarios(id, estado, Number(pagina) || 1, Math.min(Number(limite) || 50, 500));
    }

    @Post(':id/iniciar')
    iniciar(@Param('id', ParseIntPipe) id: number) {
        return this.service.iniciar(id);
    }

    @Post(':id/pausar')
    pausar(@Param('id', ParseIntPipe) id: number) {
        return this.service.pausar(id);
    }

    @Post(':id/cancelar')
    cancelar(@Param('id', ParseIntPipe) id: number) {
        return this.service.cancelar(id);
    }

    // ───────── lista de exclusión (no contactar) ─────────

    @Post('optout/:telefono')
    optout(@Param('telefono') telefono: string) {
        return this.service.agregarOptout(telefono);
    }

    @Delete('optout/:telefono')
    quitarOptout(@Param('telefono') telefono: string) {
        return this.service.quitarOptout(telefono);
    }
}