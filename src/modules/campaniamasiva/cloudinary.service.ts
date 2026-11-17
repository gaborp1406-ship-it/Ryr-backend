// cloudinary.service.ts
import {
    BadGatewayException,
    BadRequestException,
    Injectable,
    Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

export type TipoArchivo = 'image' | 'video' | 'document';

const MB = 1024 * 1024;

/** Límites de WhatsApp Cloud API para el header de una plantilla */
const LIMITES: Record<TipoArchivo, number> = {
    video: 16 * MB,
    image: 5 * MB,
    document: 100 * MB,
};

const MIMES: Record<TipoArchivo, string[]> = {
    video: ['video/mp4', 'video/quicktime', 'video/3gpp', 'video/webm', 'video/x-matroska'],
    image: ['image/jpeg', 'image/png'],
    document: ['application/pdf'],
};

export interface ArchivoSubido {
    url: string;
    tipo: TipoArchivo;
    formato: string | null;
    bytes: number;
    duracion: number | null;
    public_id: string;
}

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);
    private configurado = false;

    /** Se configura al primer uso, cuando el .env ya está cargado */
    private configurar() {
        if (this.configurado) return;
        const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
            throw new BadRequestException(
                'Faltan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET en el .env',
            );
        }
        cloudinary.config({
            cloud_name: CLOUDINARY_CLOUD_NAME,
            api_key: CLOUDINARY_API_KEY,
            api_secret: CLOUDINARY_API_SECRET,
            secure: true,
        });
        this.configurado = true;
    }

    async subir(archivo: Express.Multer.File | undefined, tipoRaw: string): Promise<ArchivoSubido> {
        if (!archivo?.buffer?.length) {
            throw new BadRequestException('No llegó ningún archivo (el campo debe llamarse "archivo")');
        }
        const tipo = tipoRaw as TipoArchivo;
        if (!(tipo in LIMITES)) throw new BadRequestException('Tipo inválido: usa image, video o document');
        if (!MIMES[tipo].includes(archivo.mimetype)) {
            throw new BadRequestException(`Formato no permitido para ${tipo}: ${archivo.mimetype}`);
        }
        if (archivo.size > LIMITES[tipo]) {
            throw new BadRequestException(
                `El archivo pesa ${(archivo.size / MB).toFixed(1)} MB y el máximo para ${tipo} es ${LIMITES[tipo] / MB} MB (límite de WhatsApp)`,
            );
        }
        this.configurar();

        const id = randomUUID();
        const opts: UploadApiOptions = {
            folder: `campanias/${tipo}`,
            resource_type: tipo === 'video' ? 'video' : tipo === 'image' ? 'image' : 'raw',
            // En "raw" el public_id conserva la extensión, así el enlace termina en .pdf
            public_id: tipo === 'document' ? `${id}.pdf` : id,
            overwrite: false,
        };
        if (tipo === 'video') {
            // WhatsApp exige MP4 con H.264 + AAC: se convierte de forma síncrona
            // para que la URL devuelta ya esté lista cuando Meta la pida
            opts.eager = [{ format: 'mp4', video_codec: 'h264', audio_codec: 'aac' }];
            opts.eager_async = false;
        }

        try {
            const res = await new Promise<UploadApiResponse>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(opts, (err, result) =>
                    err || !result ? reject(err ?? new Error('Cloudinary no devolvió respuesta')) : resolve(result),
                );
                stream.end(archivo.buffer);
            });

            const url: string = (tipo === 'video' && res.eager?.[0]?.secure_url) || res.secure_url;
            this.logger.log(`Archivo ${tipo} subido: ${res.public_id} (${(archivo.size / MB).toFixed(1)} MB)`);
            return {
                url,
                tipo,
                formato: tipo === 'video' ? 'mp4' : res.format ?? null,
                bytes: res.bytes ?? archivo.size,
                duracion: typeof res.duration === 'number' ? res.duration : null,
                public_id: res.public_id,
            };
        } catch (e: any) {
            const msg = e?.message || e?.error?.message || 'Error desconocido';
            this.logger.error(`Cloudinary falló: ${msg}`);
            throw new BadGatewayException(`No se pudo subir el archivo a Cloudinary: ${msg}`);
        }
    }
}