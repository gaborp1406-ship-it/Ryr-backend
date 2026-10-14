// whatsapp-datos.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/** Consultas compartidas entre WhatsappService y WhatsappCoexistenciaService. */
@Injectable()
export class WhatsappDatosService {
    constructor(private readonly dataSource: DataSource) { }

    async trabajadorDeNumero(phoneNumberId: string | null): Promise<number | null> {
        if (!phoneNumberId) return null;

        const [fila] = await this.dataSource.query(
            `SELECT id_trabajador FROM public.trabajador_numero_salida WHERE phone_number_id = $1 LIMIT 1`,
            [phoneNumberId],
        );
        return fila?.id_trabajador ?? null;
    }

    /** Si hay más de un lead con ese número no se adivina: devuelve null. */
    async leadDeTelefono(telefono: string): Promise<number | null> {
        const leads: Array<{ id_lead: number }> = await this.dataSource.query(
            `
            SELECT l.id AS id_lead
            FROM public.com_leads l
            INNER JOIN public.com_clientes c ON c.id = l.id_cliente
            WHERE RIGHT(regexp_replace(COALESCE(c.telefono, ''), '\\D', '', 'g'), 9) = RIGHT($1, 9)
            ORDER BY l.id DESC
            LIMIT 2
            `,
            [telefono],
        );
        return leads.length === 1 ? leads[0].id_lead : null;
    }
}