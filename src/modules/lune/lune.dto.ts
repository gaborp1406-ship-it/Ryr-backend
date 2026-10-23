import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

// Mismas listas de la hoja "Listas" de tu Excel
export const METODOS_PAGO = ['Yape', 'Plin', 'Efectivo', 'Transferencia'] as const;
export const CATEGORIAS_EGRESO = ['Insumos', 'Empaques', 'Transporte', 'Otros'] as const;
export const SOCIOS = ['Mafe', 'Gabriel'] as const;
export const ESTADOS_VENTA = ['agendado', 'entregado'] as const;

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
export class ItemVentaDto {
  @Type(() => Number) @IsInt() productoId!: number;
  @Type(() => Number) @IsInt() @Min(1) cantidad!: number;
  /** Opcional: si no lo mandas se usa el precio actual del producto */
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) precioUnitario?: number;
}

export class CrearVentaDto {
  /** Nombre del cliente. Si no existe, se crea automáticamente. */
  @IsString() @MinLength(1) cliente!: string;

  /** Productos del pedido (mínimo 1) */
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemVentaDto)
  items!: ItemVentaDto[];

  /** Opcional: si no lo mandas = suma de (precio × cantidad) de los items */
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) monto?: number;
  /** Por defecto true. Si es false queda en "cuentas por cobrar" */
  @IsOptional() @IsBoolean() pagado?: boolean;
  @IsOptional() @IsIn(METODOS_PAGO) metodoPago?: string;
  /** YYYY-MM-DD (por defecto hoy) */
  @IsOptional() @IsDateString() fecha?: string;
  @IsOptional() @IsString() notas?: string;

  /** Por defecto 'entregado' */
  @IsOptional() @IsIn(ESTADOS_VENTA) estado?: string;
  /** Fecha programada de entrega (para pedidos agendados) */
  @IsOptional() @IsDateString() fechaEntrega?: string;
}

export class FiltroVentasDto {
  @IsOptional() @IsDateString() desde?: string;
  @IsOptional() @IsDateString() hasta?: string;
  @IsOptional() @IsString() cliente?: string;
  @IsOptional() @Transform(aBoolean) @IsBoolean() pagado?: boolean;
  @IsOptional() @IsIn(ESTADOS_VENTA) estado?: string;
}

export class CambiarEstadoDto {
  @IsIn(ESTADOS_VENTA) estado!: string;
  /** Opcional: reprogramar la fecha de entrega */
  @IsOptional() @IsDateString() fechaEntrega?: string;
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


// ------------------------------------------------------------------- Stock
export const TIPOS_MOVIMIENTO = ['conteo', 'entrada', 'ajuste'] as const;

export class RegistrarMovimientoDto {
  @Type(() => Number) @IsInt() productoId!: number;
  /** conteo = inventario físico · entrada = producción/compra · ajuste = merma o corrección (+/-) */
  @IsIn(TIPOS_MOVIMIENTO) tipo!: string;
  @Type(() => Number) @IsInt() cantidad!: number;
  @IsOptional() @IsString() nota?: string;
}

export class StockMinimoDto {
  @Type(() => Number) @IsInt() @Min(0) stockMinimo!: number;
}

export class FiltroStockDto {
  @IsOptional() @IsString() buscar?: string;
  @IsOptional() @Transform(aBoolean) @IsBoolean() soloAlertas?: boolean;
}

export class FiltroMovimientosDto {
  @IsOptional() @Type(() => Number) @IsInt() productoId?: number;
  @IsOptional() @IsDateString() desde?: string;
  @IsOptional() @IsDateString() hasta?: string;
}