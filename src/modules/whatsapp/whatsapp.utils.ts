// whatsapp.utils.ts
import axios from 'axios';

export const soloDigitos = (v: unknown): string => String(v ?? '').replace(/\D/g, '');

export const ultimos9 = (v: unknown): string => soloDigitos(v).slice(-9);

/** Deja el teléfono en formato internacional (Perú: 9 dígitos -> 51 + número). */
export function normalizarTelefono(telefono: string): string {
    let d = soloDigitos(telefono);
    if (d.startsWith('00')) d = d.slice(2);
    if (d.length === 9) d = `51${d}`;
    return d;
}

export function detalleError(e: unknown): string {
    if (axios.isAxiosError(e)) {
        return (
            e.response?.data?.error?.message ??
            JSON.stringify(e.response?.data) ??
            e.message
        );
    }
    return (e as Error).message;
}