import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

// Mismas listas de la hoja "Listas" de tu Excel
export const METODOS_PAGO = ['Yape', 'Plin', 'Efectivo', 'Transferencia'] as const;
export const CATEGORIAS_EGRESO = ['Insumos', 'Empaques', 'Transporte', 'Otros'] as const;
export const SOCIOS = ['Mafe', 'Gabriel'] as const;

// "true" / "false" (query string) -> boolean
const aBoolean = ({ value }: { value: unknown }) =>
  value === 'true' || value === true ? true : value === 'false' || value === false ? false : undefined;

// ---------------------------------------------------------------- Productos
export class GuardarProductoDto {
  @IsString() @MinLength(1) nombre!: string;
  @Type(() => Number) @IsNumber() @Min(0) precio!: number;
  @IsOptional() @IsBoolean() activo?: boolean;
}

// ----------------------------------------------------------------- Clientes
export class GuardarClienteDto {
  @IsString() @MinLength(1) nombre!: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() notas?: string;
}

// ------------------------------------------------------------------- Ventas
export class CrearVentaDto {
  /** Nombre del cliente. Si no existe, se crea automáticamente. */
  @IsString() @MinLength(1) cliente!: string;
  @Type(() => Number) @IsInt() productoId!: number;
  @Type(() => Number) @IsInt() @Min(1) cantidad!: number;
  /** Opcional: si no lo mandas = precio del producto × cantidad */
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) monto?: number;
  /** Por defecto true. Si es false queda en "cuentas por cobrar" */
  @IsOptional() @IsBoolean() pagado?: boolean;
  @IsOptional() @IsIn(METODOS_PAGO) metodoPago?: string;
  /** YYYY-MM-DD (por defecto hoy) */
  @IsOptional() @IsDateString() fecha?: string;
  @IsOptional() @IsString() notas?: string;
}

export class FiltroVentasDto {
  @IsOptional() @IsDateString() desde?: string;
  @IsOptional() @IsDateString() hasta?: string;
  @IsOptional() @IsString() cliente?: string;
  @IsOptional() @Transform(aBoolean) @IsBoolean() pagado?: boolean;
}

export class CobrarDto {
  @IsOptional() @IsIn(METODOS_PAGO) metodoPago?: string;
}

// ------------------------------------------------------------------ Egresos
export class CrearEgresoDto {
  @IsString() @MinLength(1) concepto!: string;
  @Type(() => Number) @IsNumber() @Min(0) monto!: number;
  @IsOptional() @IsIn(CATEGORIAS_EGRESO) categoria?: string;
  @IsOptional() @IsString() proveedor?: string;
  @IsOptional() @IsIn(METODOS_PAGO) metodoPago?: string;
  @IsOptional() @IsString() socio?: string;
  @IsOptional() @IsDateString() fecha?: string;
}

export class FiltroEgresosDto {
  @IsOptional() @IsDateString() desde?: string;
  @IsOptional() @IsDateString() hasta?: string;
  @IsOptional() @IsIn(CATEGORIAS_EGRESO) categoria?: string;
}

// ----------------------------------------------------------------- Reportes
export class FiltroReporteDto {
  @IsOptional() @IsDateString() desde?: string;
  @IsOptional() @IsDateString() hasta?: string;
}